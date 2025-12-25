const auth = require('firebase-tools/lib/auth');

const PROJECT_ID = 'devpath-website';
const DATABASE_ID = '(default)';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

async function migrateToRoot() {
    console.log("Starting Migration: Subcollections -> Root Collection...");

    try {
        // 1. Get Token
        const account = auth.getGlobalDefaultAccount();
        if (!account || !account.tokens || !account.tokens.access_token) {
            throw new Error("No access token. Run 'firebase login'.");
        }
        const token = account.tokens.access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Find all projects using Collection Group Query
        console.log("Fetching all projects from subcollections...");
        const query = {
            structuredQuery: {
                from: [{ collectionId: 'projects', allDescendants: true }]
            }
        };

        const queryRes = await fetch(`${BASE_URL}:runQuery`, {
            method: 'POST',
            headers,
            body: JSON.stringify(query)
        });

        if (!queryRes.ok) {
            throw new Error(`Query failed: ${queryRes.status} ${await queryRes.text()}`);
        }

        const queryData = await queryRes.json();
        const documents = queryData
            .filter(item => item.document)
            .map(item => item.document);

        console.log(`Found ${documents.length} projects to migrate.`);

        let success = 0;
        let errors = 0;

        // 3. Copy to Root Collection
        for (const doc of documents) {
            const docId = doc.name.split('/').pop();
            const fields = doc.fields;

            // Ensure userId is present
            if (!fields.userId) {
                console.warn(`Skipping ${docId}: No userId field.`);
                continue;
            }

            console.log(`Migrating ${docId} (${fields.title?.stringValue})...`);

            const targetUrl = `${BASE_URL}/projects/${docId}`;

            try {
                // Check if already exists in root (optional, but good to avoid overwrite if not needed, 
                // but here we want to ensure latest data, so we overwrite/patch)
                const patchRes = await fetch(targetUrl, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ fields })
                });

                if (!patchRes.ok) {
                    throw new Error(`Failed to write: ${patchRes.status} ${await patchRes.text()}`);
                }

                console.log(` - Copied to root/projects/${docId}`);
                success++;
            } catch (err) {
                console.error(` - Error copying ${docId}:`, err.message);
                errors++;
            }
        }

        console.log("--------------------------------------------------");
        console.log(`Migration Complete. Success: ${success}, Errors: ${errors}`);
        console.log("--------------------------------------------------");

    } catch (err) {
        console.error("Fatal Error:", err.message);
    }
}

migrateToRoot();
