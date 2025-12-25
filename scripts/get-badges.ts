
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyALGINp8VYQS17ODls_lcOHPeh4HSBVG6A",
    authDomain: "devpath-website.firebaseapp.com",
    projectId: "devpath-website",
    storageBucket: "devpath-website.firebasestorage.app",
    messagingSenderId: "1045735850932",
    appId: "1:1045735850932:web:305a30d27b23d8e8c468e1",
    measurementId: "G-6CW7LMVKJ4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getBadges() {
    try {
        const membersRef = collection(db, 'members');
        const snapshot = await getDocs(membersRef);

        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.name === 'Tony Stark') {
                console.log(`User: ${data.name}`);
                console.log(`Achievements: ${JSON.stringify(data.achievements || [])}`);
                console.log('---');
            }
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

getBadges();
