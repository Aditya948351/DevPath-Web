const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function debugProjects() {
    console.log('--- Debugging Projects ---');

    // 1. Check Root Collection
    console.log('\n1. Checking Root "projects" collection...');
    const rootProjects = await db.collection('projects').get();
    console.log(`Found ${rootProjects.size} projects in root collection.`);
    rootProjects.forEach(doc => {
        console.log(` - ${doc.id}: ${doc.data().title} (createdAt: ${doc.data().createdAt?.toDate()})`);
    });

    // 2. Check Subcollections via Collection Group
    console.log('\n2. Checking "projects" Collection Group...');
    const groupProjects = await db.collectionGroup('projects').get();
    console.log(`Found ${groupProjects.size} projects in collection group.`);

    groupProjects.forEach(doc => {
        console.log(` - [${doc.ref.path}] ${doc.data().title} (StarCount: ${doc.data().starCount}, CreatedAt: ${doc.data().createdAt?.toDate()})`);
    });

    if (groupProjects.size === 0) {
        console.log('\nWARNING: No projects found in collection group. The Showcase will be empty.');
    } else {
        console.log('\nData exists. If Showcase is empty, it is likely an Index or Rule issue.');
    }
}

debugProjects().catch(console.error);
