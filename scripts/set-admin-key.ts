import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

const KEY = "devpath-admin-2025";

async function setKey() {
    try {
        console.log(`Setting admin key: ${KEY}...`);
        await setDoc(doc(db, 'superadmin_keys', 'config'), {
            value: KEY,
            updatedAt: new Date().toISOString(),
            updatedBy: 'script'
        });
        console.log("Admin key set successfully in 'superadmin_keys/config'.");
    } catch (error) {
        console.error("Error setting admin key:", error);
    }
    process.exit();
}

setKey();

