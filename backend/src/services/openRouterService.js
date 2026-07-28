const AppError = require('../utils/AppError');
const {
  KNOWLEDGE_BASE,
  CONSTRAINTS,
  TONE_AND_GUIDELINES,
  FALLBACK_RESPONSES,
} = require('../config/chatbotConfig');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_PRIMARY_MODEL = 'openai/gpt-oss-120b:free';
const DEFAULT_FALLBACK_MODELS = [
  'nvidia/nemotron-3-super:free',
  'deepseek/deepseek-v4-flash:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b:free',
];
const DEFAULT_MODEL_WEIGHTS = {
  [DEFAULT_PRIMARY_MODEL]: 100,
  'nvidia/nemotron-3-super:free': 95,
  'deepseek/deepseek-v4-flash:free': 90,
  'qwen/qwen3-next-80b-a3b-instruct:free': 85,
  'meta-llama/llama-3.3-70b-instruct:free': 80,
  'google/gemma-4-31b:free': 75,
};

const getSystemPrompt = () => {
  return `You are DevPath Assistant. Provide practical, concise, learner-friendly guidance for developers based on the structured knowledge base and instructions below.

# STRUCTURED KNOWLEDGE BASE:
${JSON.stringify(KNOWLEDGE_BASE, null, 2)}

# CONSTRAINTS:
${CONSTRAINTS.map((c, idx) => `${idx + 1}. ${c}`).join('\n')}

# TONE & GUIDELINES:
${TONE_AND_GUIDELINES.map((g, idx) => `${idx + 1}. ${g}`).join('\n')}

# FALLBACK RESPONSES (USE EXACTLY OR ADAPT GRACEFULLY WHEN A QUERY IS OUT-OF-SCOPE OR UNKNOWN):
- Out of scope fallback: "${FALLBACK_RESPONSES.outOfScope}"
- Unknown feature/details fallback: "${FALLBACK_RESPONSES.unknownFeature}"

Important: If the user query is not related to the DevPath platform, its features, community, events, open-source repositories, or curated guides/roadmaps, you MUST reply with the out-of-scope fallback response. Do not provide code examples for general programming queries unless it directly teaches something about DevPath platform guides.`;
};

const buildMessages = (history, message) => {
  const systemMessage = {
    role: 'system',
    content: getSystemPrompt(),
  };

  const safeHistory = Array.isArray(history) ? history : [];

  return [
    systemMessage,
    ...safeHistory.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    { role: 'user', content: message },
  ];
};

const parseModelList = (value) =>
  String(value || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

const parseModelWeights = (value) =>
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((weights, entry) => {
      const [model, rawWeight] = entry.split('=').map((part) => part.trim());

      if (model && rawWeight && !Number.isNaN(Number(rawWeight))) {
        weights[model] = Number(rawWeight);
      }

      return weights;
    }, {});

const getWeightForModel = (model, overrides = {}) => {
  if (Object.prototype.hasOwnProperty.call(overrides, model)) {
    return overrides[model];
  }

  if (Object.prototype.hasOwnProperty.call(DEFAULT_MODEL_WEIGHTS, model)) {
    return DEFAULT_MODEL_WEIGHTS[model];
  }

  return 0;
};

const getModelCandidates = () => {
  const primaryModel = process.env.OPENROUTER_MODEL || DEFAULT_PRIMARY_MODEL;
  const fallbackModels = process.env.OPENROUTER_FALLBACK_MODELS
    ? parseModelList(process.env.OPENROUTER_FALLBACK_MODELS)
    : DEFAULT_FALLBACK_MODELS;
  const weightOverrides = process.env.OPENROUTER_MODEL_WEIGHTS
    ? parseModelWeights(process.env.OPENROUTER_MODEL_WEIGHTS)
    : {};

  const uniqueFallbackModels = fallbackModels.filter(
    (model, index, models) => models.indexOf(model) === index
  );
  const orderedFallbackModels = uniqueFallbackModels.sort(
    (leftModel, rightModel) => {
      const rightWeight = getWeightForModel(rightModel, weightOverrides);
      const leftWeight = getWeightForModel(leftModel, weightOverrides);

      if (rightWeight !== leftWeight) {
        return rightWeight - leftWeight;
      }

      return leftModel.localeCompare(rightModel);
    }
  );

  return [primaryModel, ...orderedFallbackModels].filter(
    (model, index, models) => models.indexOf(model) === index
  );
};

const getRequestHeaders = (apiKey) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
  'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://devpath.tech',
  'X-Title': process.env.OPENROUTER_APP_NAME || 'DevPath Assistant',
});

const isRetryableOpenRouterError = (statusCode) =>
  statusCode === 408 ||
  statusCode === 425 ||
  statusCode === 429 ||
  statusCode >= 500;

const callOpenRouter = async ({ apiKey, model, message, history }) => {
  const payload = {
    model,
    messages: buildMessages(history, message),
    stream: false,
  };

  let response;
  let data = null;

  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: getRequestHeaders(apiKey),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new AppError(
        errorBody?.error?.message || `OpenRouter request failed for model ${model}`,
        response.status,
        'OPENROUTER_ERROR'
      );
    }

    data = await response.json();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `OpenRouter network request failed for model ${model}: ${error.message}`,
      502,
      'OPENROUTER_NETWORK_ERROR'
    );
  }

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new AppError(
      `Model reply is empty for ${model}`,
      502,
      'EMPTY_MODEL_RESPONSE'
    );
  }

  return {
    reply,
    providerPayload: data,
    model,
  };
};

const createChatCompletion = async ({ message, history = [] }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AppError(
      'OPENROUTER_API_KEY is not configured',
      500,
      'CONFIG_ERROR'
    );
  }

  const modelCandidates = getModelCandidates();

  let lastError = null;

  for (let index = 0; index < modelCandidates.length; index += 1) {
    const model = modelCandidates[index];

    try {
      return await callOpenRouter({ apiKey, model, message, history });
    } catch (error) {
      lastError = error;

      const shouldRetry =
        error instanceof AppError &&
        error.code === 'OPENROUTER_ERROR' &&
        isRetryableOpenRouterError(error.statusCode);

      if (!shouldRetry || index === modelCandidates.length - 1) {
        throw error;
      }
    }
  }

  throw (
    lastError ||
    new AppError('OpenRouter request failed', 502, 'OPENROUTER_ERROR')
  );
};

const createStreamingChatCompletionConfig = ({ message, history = [] }) => {
  const model = getModelCandidates()[0];
  const apiKey = process.env.OPENROUTER_API_KEY;

  return {
    url: OPENROUTER_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://devpath.tech',
      'X-Title': process.env.OPENROUTER_APP_NAME || 'DevPath Assistant',
    },
    body: {
      model,
      messages: buildMessages(history, message),
      stream: true,
    },
  };
};

module.exports = {
  createChatCompletion,
  createStreamingChatCompletionConfig,
};
