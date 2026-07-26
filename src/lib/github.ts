const GITHUB_API =
  process.env.NEXT_PUBLIC_GITHUB_API_BASE_URL ?? 'https://api.github.com';
const DEVPATH_REPO =
  process.env.NEXT_PUBLIC_GITHUB_REPO ??
  'devpathindcommunity-india/DevPath-Web';
const PER_PAGE = process.env.NEXT_PUBLIC_GITHUB_PER_PAGE ?? '100';
export const fetchUserProfile = async (token: string) => {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch GitHub profile');
  return res.json();
};

export const fetchUserRepos = async (token: string) => {
  const res = await fetch(
    `${GITHUB_API}/user/repos?sort=updated&per_page=${PER_PAGE}&type=all`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch repositories');
  return res.json();
};

export const fetchUserActivity = async (username: string, token: string) => {
  // Note: Events API might not need token for public events, but better to use it for rate limits
  const res = await fetch(
    `${GITHUB_API}/users/${username}/events?per_page=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch user activity');
  return res.json();
};

// Fallback contribution stats calculated from local repository Git log analysis
export const GIT_FALLBACK_STATS: Record<
  string,
  { additions: number; deletions: number; commits: number }
> = {
  aditya948351: { additions: 49917, deletions: 18400, commits: 78 },
  'devpathindcommunity-india': {
    additions: 49917,
    deletions: 18400,
    commits: 78,
  },
  'devpathind-community': { additions: 49917, deletions: 18400, commits: 78 },
  schrodingerspet: { additions: 16582, deletions: 1172, commits: 16 },
  bhavyaxtech: { additions: 1175, deletions: 424, commits: 2 },
  niteshagarwal01: { additions: 525, deletions: 226, commits: 6 },
  deepiga0706: { additions: 271, deletions: 0, commits: 1 },
  nishantdakua: { additions: 8, deletions: 8, commits: 1 },
  'swathi-chippa': { additions: 1, deletions: 11, commits: 1 },
  mzl2233: { additions: 0, deletions: 2, commits: 1 },
};

export const fetchRepoContributorStats = async (token?: string) => {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'DevPath-Website',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res = await fetch(
      `${GITHUB_API}/repos/${DEVPATH_REPO}/stats/contributors`,
      { headers }
    );

    // Handle 202 status code by doing a brief retry loop
    let retries = 0;
    while (res.status === 202 && retries < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      res = await fetch(
        `${GITHUB_API}/repos/${DEVPATH_REPO}/stats/contributors`,
        { headers }
      );
      retries++;
    }

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (e) {
    console.error('Error fetching repo contributor stats:', e);
    return null;
  }
};

export const calculateUserLinesContributed = (
  stats: any[] | null,
  username: string
) => {
  let additions = 0;
  let deletions = 0;
  let commits = 0;

  const lowerUsername = username.toLowerCase();
  const isAdityaOrCommunity =
    lowerUsername === 'aditya948351' ||
    lowerUsername === 'devpathindcommunity-india' ||
    lowerUsername === 'devpathind-community';

  if (stats && Array.isArray(stats)) {
    for (const contributor of stats) {
      if (!contributor || !contributor.author) continue;
      const login = contributor.author.login.toLowerCase();
      let match = false;

      if (isAdityaOrCommunity) {
        // Aditya controls Aditya948351 and the community accounts
        match =
          login === 'aditya948351' ||
          login === 'devpathindcommunity-india' ||
          login === 'devpathind-community';
      } else {
        match = login === lowerUsername;
      }

      if (match) {
        commits += contributor.total || 0;
        if (contributor.weeks) {
          for (const week of contributor.weeks) {
            additions += week.a || 0;
            deletions += week.d || 0;
          }
        }
      }
    }
  }

  // Use fallback if stats returned empty or user has 0 additions but is in our fallback list
  if (additions === 0) {
    const fallback = GIT_FALLBACK_STATS[lowerUsername];
    if (fallback) {
      additions = fallback.additions;
      deletions = fallback.deletions;
      commits = fallback.commits;
    }
  }

  return { additions, deletions, commits };
};
