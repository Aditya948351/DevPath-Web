
const auth = require('firebase-tools/lib/auth');

const PROJECT_ID = 'devpath-website';
const DATABASE_ID = '(default)';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

async function testAddProject() {
    console.log("Testing Add Project...");

    try {
        // 1. Get Token
        const account = auth.getGlobalDefaultAccount();
        if (!account || !account.tokens || !account.tokens.access_token) {
            throw new Error("No access token. Run 'firebase login'.");
        }
        const token = account.tokens.access_token;
        const userEmail = account.user.email;
        console.log(`Token retrieved for ${userEmail}`);

        // We need a userId. Since we are logged in as admin/developer, we might not have a "member" userId easily.
        // But we can try to find a user or use a dummy one if we are testing permissions.
        // However, security rules might restrict writing to *other* users' subcollections.
        // Let's try to list members and pick one, or use the "admin" user if they are a member.

        // Let's first get the user's UID from the token if possible, or just list members.
        // Actually, the CLI token is for the Google Account, which maps to a Firebase User.
        // Let's try to get the user object from the token endpoint or just list members.

        console.log("Fetching a member to test with...");
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const listRes = await fetch(`${BASE_URL}/members?pageSize=1`, { headers });
        if (!listRes.ok) {
            console.log("Could not list members. Trying to create a dummy one?");
            // If we can't list members, we might be blocked.
            const text = await listRes.text();
            console.error("List members failed:", text);
            return;
        }

        const listData = await listRes.json();
        const members = listData.documents;

        if (!members || members.length === 0) {
            console.error("No members found to test with.");
            return;
        }

        const memberPath = members[0].name; // projects/.../documents/members/{userId}
        const userId = memberPath.split('/').pop();
        console.log(`Testing with user: ${userId}`);

        // 2. Try to add a project
        const projectData = {
            fields: {
                title: { stringValue: "Test Project CLI" },
                description: { stringValue: "Created via test script" },
                userId: { stringValue: userId },
                createdAt: { timestampValue: new Date().toISOString() }
            }
        };

        const targetUrl = `${BASE_URL}/members/${userId}/projects`;
        console.log(`Attempting to POST to ${targetUrl}`);

        const res = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(projectData)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Failed to create project: ${res.status} ${errText}`);
        }

        const resData = await res.json();
        console.log("Project created successfully!", resData.name);

    } catch (err) {
        console.error("Test Failed:", err);
    }
}

testAddProject();
