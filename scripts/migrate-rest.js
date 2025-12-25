
const apiv2 = require('firebase-tools/lib/apiv2');
const logger = require('firebase-tools/lib/logger');

// Silence logger
logger.transports = [];

const PROJECT_ID = 'devpath-website';
const DATABASE_ID = '(default)';
const FIRESTORE_ORIGIN = 'https://firestore.googleapis.com';
const BASE_PATH = `/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

async function migrate() {
    console.log("Starting REST-based Migration (apiv2)...");

    try {
        const client = new apiv2.Client({
            urlPrefix: FIRESTORE_ORIGIN,
            auth: true
        });

        // 1. List all projects
        console.log("Fetching projects...");
        const response = await client.get(`${BASE_PATH}/projects`);

        const documents = response.body.documents;
        if (!documents || documents.length === 0) {
            console.log("No projects found.");
            return;
        }

        console.log(`Found ${documents.length} projects.`);

        let success = 0;
        let errors = 0;

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

            // 2. Write to new location
            const targetPath = `${BASE_PATH}/members/${userId}/projects/${projectId}`;

            try {
                // Use PATCH to upsert
                await client.patch(targetPath, {
                    fields: fields
                });
                console.log(`Success: ${projectId}`);
                success++;
            } catch (err) {
                console.error(`Failed to write ${projectId}:`, err.message || err);
                errors++;
            }
        }

        console.log(`Migration Complete. Success: ${success}, Errors: ${errors}`);

    } catch (err) {
        console.error("Migration Fatal Error:", err);
    }
}

migrate();
