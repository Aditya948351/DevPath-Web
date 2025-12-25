const auth = require('firebase-tools/lib/auth');

const PROJECT_ID = 'devpath-website';
const DATABASE_ID = '(default)';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

async function debugRootProjects() {
    console.log("Checking Root 'projects' Collection...");

    try {
        const account = auth.getGlobalDefaultAccount();
        if (!account || !account.tokens || !account.tokens.access_token) {
            throw new Error("No access token. Run 'firebase login'.");
        }
        const token = account.tokens.access_token;

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // List documents in root 'projects' collection
        const res = await fetch(`${BASE_URL}/projects?pageSize=10`, { headers });

        if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.status} ${await res.text()}`);
        }

        const data = await res.json();
        const documents = data.documents || [];

        if (documents.length === 0) {
            console.log("RESULT: Root 'projects' collection is EMPTY.");
        } else {
            console.log(`RESULT: Found ${documents.length} projects in ROOT collection.`);
            documents.forEach(doc => {
                const title = doc.fields.title?.stringValue || 'Untitled';
                console.log(` - ${doc.name.split('/').pop()} | ${title}`);
            });
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

debugRootProjects();
