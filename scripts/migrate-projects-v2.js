
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Attempt to initialize with default credentials (gcloud/firebase CLI)
try {
    initializeApp({
        credential: applicationDefault(),
        projectId: 'devpath-website' // Hardcoded from environment check
    });
} catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
    process.exit(1);
}

const db = getFirestore();

async function migrateProjects() {
    console.log("Starting Project Migration (Server-Side)...");

    try {
        // 1. Get all projects from the root 'projects' collection
        const projectsSnapshot = await db.collection('projects').get();

        if (projectsSnapshot.empty) {
            console.log("No projects found in root collection.");
            return;
        }

        console.log(`Found ${projectsSnapshot.size} projects to migrate.`);

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // 2. Iterate and move
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
                // 3. Write to subcollection: members/{userId}/projects/{projectId}
                const targetRef = db.collection('members').doc(userId).collection('projects').doc(projectId);

                // Check if already exists
                const targetDoc = await targetRef.get();
                if (targetDoc.exists) {
                    console.log(`Project ${projectId} already exists in subcollection. Skipping.`);
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
        console.error("Fatal Error during migration:", error);
        if (error.code === 7) { // PERMISSION_DENIED or similar
            console.error("Error: Permission Denied. Please ensure you are logged in with 'gcloud auth application-default login' or have a valid service account.");
        }
    }
}

migrateProjects();
