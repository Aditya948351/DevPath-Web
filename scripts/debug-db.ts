
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const serviceAccount = require('../service-account.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Failed to load service-account.json. Make sure it exists in the root directory.");
        process.exit(1);
    }
}

const db = admin.firestore();

async function debugDB() {
    console.log("--- Debugging Firestore ---");

    try {
        const collections = await db.listCollections();
        console.log("Collections found:", collections.map(c => c.id));

        if (collections.some(c => c.id === 'members')) {
            console.log("\nChecking 'members' collection:");
            const membersSnapshot = await db.collection('members').limit(5).get();
            if (membersSnapshot.empty) {
                console.log("  - Collection 'members' exists but is EMPTY.");
            } else {
                console.log(`  - Found ${membersSnapshot.size} documents (showing first 5):`);
                membersSnapshot.docs.forEach(doc => {
                    console.log(`    - ID: ${doc.id}, Data:`, JSON.stringify(doc.data(), null, 2));
                });
            }
        } else {
            console.log("\nCollection 'members' does NOT exist.");
        }

    } catch (error) {
        console.error("Error debugging DB:", error);
    }
}

debugDB();
