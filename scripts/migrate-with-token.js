
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const auth = require('firebase-tools/lib/auth');
const config = require('firebase-tools/lib/config');

async function migrate() {
    console.log("Authenticating via firebase-tools...");

    try {
        // Get the access token from the CLI session
        const account = auth.getGlobalDefaultAccount();

        if (!account || !account.tokens || !account.tokens.access_token) {
            throw new Error("No access token available. Please run 'firebase login' first.");
        }

        const accessToken = account.tokens.access_token;
        console.log("Access token retrieved successfully.");

        // Initialize Firebase Admin with the token
        initializeApp({
            credential: {
                getAccessToken: () => Promise.resolve({
                    access_token: accessToken,
                    expires_in: 3600
                })
            },
            projectId: 'devpath-website'
        });

        const db = getFirestore();
        console.log("Firestore initialized.");

        // Migration Logic
        console.log("Starting Project Migration...");
        const projectsSnapshot = await db.collection('projects').get();

        if (projectsSnapshot.empty) {
            console.log("No projects found in root collection.");
            return;
        }

        console.log(`Found ${projectsSnapshot.size} projects to migrate.`);

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        for (const doc of projectsSnapshot.docs) {
            const projectData = doc.data();
            const projectId = doc.id;
            const userId = projectData.userId;

            if (!userId) {
                console.warn(`Skipping project ${projectId}: No userId found.`);
                errorCount++;
                continue;
            }

            try {
                const targetRef = db.collection('members').doc(userId).collection('projects').doc(projectId);
                const targetDoc = await targetRef.get();

                if (targetDoc.exists) {
                    console.log(`Project ${projectId} already exists. Skipping.`);
                    skippedCount++;
                } else {
                    await targetRef.set(projectData);
                    console.log(`Migrated project ${projectId} to user ${userId}`);
                    successCount++;
                }
            } catch (err) {
                console.error(`Failed to migrate project ${projectId}:`, err);
                errorCount++;
            }
        }

        console.log("--------------------------------------------------");
        console.log(`Migration Complete.`);
        console.log(`Success: ${successCount}`);
        console.log(`Skipped: ${skippedCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log("--------------------------------------------------");

    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
}

migrate();
