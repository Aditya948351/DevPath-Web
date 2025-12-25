
const auth = require('firebase-tools/lib/auth');

const PROJECT_ID = 'devpath-website';
const DATABASE_ID = '(default)';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

async function migrate() {
    console.log("Starting Migration via Fetch...");

    try {
        // 1. Get Token
        const account = auth.getGlobalDefaultAccount();
        if (!account || !account.tokens || !account.tokens.access_token) {
            throw new Error("No access token. Run 'firebase login'.");
        }
        const token = account.tokens.access_token;
        console.log("Token retrieved.");

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. List Projects
        console.log("Fetching projects...");
        const listRes = await fetch(`${BASE_URL}/projects?pageSize=300`, { headers });

        if (!listRes.ok) {
            const errText = await listRes.text();
            throw new Error(`Failed to list projects: ${listRes.status} ${errText}`);
        }

        const listData = await listRes.json();
        const documents = listData.documents;

        if (!documents || documents.length === 0) {
            console.log("No projects found.");
            return;
        }

        console.log(`Found ${documents.length} projects.`);

        let success = 0;
        let errors = 0;

        // 3. Migrate
        for (const doc of documents) {
            const docName = doc.name;
            const projectId = docName.split('/').pop();
            const fields = doc.fields;

            const userId = fields.userId?.stringValue;

            if (!userId) {
                console.warn(`Skipping ${projectId}: No userId.`);
                continue;
            }

            console.log(`Migrating ${projectId} to user ${userId}...`);

            const targetPath = `members/${userId}/projects/${projectId}`;
            const url = `${BASE_URL}/${targetPath}`;

            try {
                const patchRes = await fetch(url, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ fields })
                });

                if (!patchRes.ok) {
                    const errText = await patchRes.text();
                    throw new Error(`Failed to write: ${patchRes.status} ${errText}`);
                }

                console.log(`Success: ${projectId}`);
                success++;
            } catch (err) {
                console.error(`Error migrating ${projectId}:`, err.message);
                errors++;
            }
        }

        console.log("--------------------------------------------------");
        console.log(`Migration Complete. Success: ${success}, Errors: ${errors}`);
        console.log("--------------------------------------------------");

    } catch (err) {
        console.error("Fatal Error:", err);
    }
}

migrate();
