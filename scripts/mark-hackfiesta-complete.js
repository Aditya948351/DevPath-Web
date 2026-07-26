const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
} = require('firebase/firestore');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log('Fetching all events...');

  const q = query(collection(db, 'events'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log('No events found in collection "events".');
    return;
  }

  const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  console.log('Events found:');
  events.forEach((e) => {
    console.log(
      `ID: ${e.id} | Title: "${e.title}" | Completed: ${e.completed}`
    );
  });

  // Try to find one that looks like HackFiesta
  const fiesta = events.find(
    (e) =>
      e.title &&
      (e.title.includes('Hack') ||
        e.title.includes('Fiesta') ||
        e.title.includes('Fiesta'))
  );

  if (fiesta) {
    console.log(`\nMatch found: ${fiesta.title} (${fiesta.id})`);
    if (fiesta.completed !== true) {
      console.log('Updating to completed: true...');
      await updateDoc(doc(db, 'events', fiesta.id), {
        completed: true,
      });
      console.log('Update successful!');
    } else {
      console.log('Already marked as completed.');
    }
  } else {
    console.log('\nNo match found for Hack/Fiesta.');
  }
}

main().catch(console.error);
