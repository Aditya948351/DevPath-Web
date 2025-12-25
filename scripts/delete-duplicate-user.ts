import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

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

async function deleteDuplicate() {
    console.log("Searching for duplicate Pranav Khaire to delete...");

    const membersRef = collection(db, 'members');
    const q = query(membersRef, where("name", "==", "Pranav Khaire"));
    const snapshot = await getDocs(q);

    let deletedCount = 0;

    for (const memberDoc of snapshot.docs) {
        const data = memberDoc.data();
        const points = data.points || 0;

        // Target the one with ~103 points (less than 200 to be safe)
        if (points < 200) {
            console.log(`Deleting duplicate user: ${memberDoc.id} with ${points} points...`);

            // Delete from members
            await deleteDoc(doc(db, 'members', memberDoc.id));
            console.log(`- Deleted from members`);

            // Delete from leaderboard
            await deleteDoc(doc(db, 'leaderboard', memberDoc.id));
            console.log(`- Deleted from leaderboard`);

            deletedCount++;
        } else {
            console.log(`Keeping user: ${memberDoc.id} with ${points} points.`);
        }
    }

    if (deletedCount === 0) {
        console.log("No duplicate found with < 200 points.");
    } else {
        console.log(`Successfully deleted ${deletedCount} duplicate(s).`);
    }

    process.exit();
}

deleteDuplicate();
