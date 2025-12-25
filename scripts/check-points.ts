import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";

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

async function checkPoints() {
    try {
        const membersRef = collection(db, 'members');
        const snapshot = await getDocs(membersRef);

        for (const memberDoc of snapshot.docs) {
            const data = memberDoc.data();
            if (data.name === 'Tony Stark') {
                console.log(`SUMMARY: User=${data.name}, Points=${data.points}, BadgeCount=${data.achievements?.length}`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
    process.exit();
}

checkPoints();
