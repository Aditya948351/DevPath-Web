
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!serviceAccount.project_id) {
    console.error('Error: FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid.');
    process.exit(1);
}

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

const SUPER_ADMIN_EMAIL = "devpathind.community@gmail.com";

async function deleteCollection(collectionPath: string, batchSize: number) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db: FirebaseFirestore.Firestore, query: FirebaseFirestore.Query, resolve: any) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

async function getAdminEmails() {
    const adminsSnapshot = await db.collection('admins').get();
    const adminEmails = new Set<string>();
    adminEmails.add(SUPER_ADMIN_EMAIL);

    adminsSnapshot.forEach(doc => {
        if (doc.id.includes('@')) {
            adminEmails.add(doc.id);
        } else if (doc.data().email) {
            adminEmails.add(doc.data().email);
        }
    });

    return adminEmails;
}

async function deleteAllAuthUsers(adminEmails: Set<string>) {
    console.log('Fetching all users...');
    let nextPageToken;
    let deletedCount = 0;

    do {
        const listUsersResult = await auth.listUsers(1000, nextPageToken);
        const usersToDelete = listUsersResult.users
            .filter(user => user.email && !adminEmails.has(user.email))
            .map(user => user.uid);

        if (usersToDelete.length > 0) {
            await auth.deleteUsers(usersToDelete);
            deletedCount += usersToDelete.length;
            console.log(`Deleted ${usersToDelete.length} users.`);
        }

        nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`Total users deleted: ${deletedCount}`);
}

async function main() {
    console.log('Starting cleanup...');

    try {
        // 1. Get Admins to preserve
        const adminEmails = await getAdminEmails();
        console.log('Preserving Admins:', Array.from(adminEmails));

        // 2. Delete Auth Users
        console.log('Deleting Auth users...');
        await deleteAllAuthUsers(adminEmails);

        // 3. Delete Collections
        console.log('Deleting members collection...');
        await deleteCollection('members', 50);
        console.log('Deleted members collection.');

        console.log('Deleting leaderboard collection...');
        await deleteCollection('leaderboard', 50);
        console.log('Deleted leaderboard collection.');

        console.log('Cleanup complete.');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

main();
