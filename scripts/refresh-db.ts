
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'service-account-key.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error("Service account key not found at:", serviceAccountPath);
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function refreshDB() {
    console.log("Starting DB Refresh...");

    // 1. Refresh Members
    console.log("Refreshing Members...");
    const membersSnapshot = await db.collection('members').get();
    let updatedMembers = 0;

    for (const doc of membersSnapshot.docs) {
        const data = doc.data();
        const updates: any = {};

        // Ensure fields exist
        if (!data.points) updates.points = 0;
        if (!data.streak) updates.streak = 0;
        if (!data.followers) updates.followers = [];
        if (!data.following) updates.following = [];
        if (!data.achievements) updates.achievements = [];
        if (!data.loginDates) updates.loginDates = [];

        // Recalculate Level (Optional, logic is in client but good to have consistent)
        // We won't store level in DB explicitly if we calculate it on fly, but if we did:
        // updates.level = calculateLevel(data.points || 0).currentLevel.name;

        if (Object.keys(updates).length > 0) {
            await doc.ref.update(updates);
            updatedMembers++;
        }
    }
    console.log(`Updated ${updatedMembers} members.`);

    // 2. Refresh Leaderboard
    console.log("Refreshing Leaderboard...");
    const leaderboardSnapshot = await db.collection('leaderboard').get();
    const batch = db.batch();

    // Clear old leaderboard (optional, or just overwrite)
    // Actually, let's just ensure every member is in leaderboard
    for (const doc of membersSnapshot.docs) {
        const data = doc.data();
        const leaderboardRef = db.collection('leaderboard').doc(doc.id);
        batch.set(leaderboardRef, {
            uid: doc.id,
            name: data.name || 'Anonymous',
            photoURL: data.photoURL || null,
            points: data.points || 0,
            role: data.role || 'member',
            lastActive: new Date().toISOString().split('T')[0] // Approximate
        }, { merge: true });
    }
    await batch.commit();
    console.log("Leaderboard refreshed.");

    console.log("DB Refresh Complete.");
}

refreshDB().catch(console.error);
