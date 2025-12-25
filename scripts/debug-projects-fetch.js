const auth = require('firebase-tools/lib/auth');

const PROJECT_ID = 'devpath-website';
const DATABASE_ID = '(default)';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

async function debugProjects() {
    console.log("Starting Debug via Fetch...");

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

        // 2. Run Collection Group Query
        console.log("Running Collection Group Query for 'projects'...");
        const query = {
            structuredQuery: {
                from: [{ collectionId: 'projects', allDescendants: true }],
                limit: 10
            }
        };

        const queryRes = await fetch(`${BASE_URL}:runQuery`, {
            method: 'POST',
            headers,
            body: JSON.stringify(query)
        });

        if (!queryRes.ok) {
            const errText = await queryRes.text();
            throw new Error(`Query failed: ${queryRes.status} ${errText}`);
        }

        const queryData = await queryRes.json();

        // queryData is an array of objects, each containing 'document' or 'readTime'
        const documents = queryData
            .filter(item => item.document)
            .map(item => item.document);

        if (documents.length === 0) {
            console.log("No projects found in Collection Group.");
        } else {
            console.log(`Found ${documents.length} projects in Collection Group:`);
            documents.forEach(doc => {
                const title = doc.fields.title?.stringValue || 'Untitled';
                const starCount = doc.fields.starCount?.integerValue || 0;
                console.log(` - ${doc.name} | Title: ${title} | Stars: ${starCount}`);
            });
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

debugProjects();
