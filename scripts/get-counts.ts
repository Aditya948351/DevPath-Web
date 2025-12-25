
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

const SOCIAL_BADGES = ['social-github', 'social-linkedin', 'social-instagram'];

async function getCounts() {
    try {
        const membersRef = collection(db, 'members');
        const snapshot = await getDocs(membersRef);

        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.name === 'Tony Stark' || data.name === 'Aditya Patil') {
                const uid = doc.id;
                const achievements = data.achievements || [];
                let socialBadges = 0;
                let standardBadges = 0;
                achievements.forEach((b: string) => {
                    if (SOCIAL_BADGES.includes(b)) socialBadges++;
                    else standardBadges++;
                });

                const followers = (data.followers || []).length;
                const streak = data.streak || 0;

                // Fetch projects
                const projectsRef = collection(db, 'members', uid, 'projects');
                const projectsSnap = await getDocs(projectsRef);
                const projectCount = projectsSnap.size;
                let totalStars = 0;
                projectsSnap.forEach(p => totalStars += (p.data().stars || []).length);

                console.log(`User: ${data.name}`);
                console.log(`  Social Badges: ${socialBadges}`);
                console.log(`  Standard Badges: ${standardBadges}`);
                console.log(`  Followers: ${followers}`);
                console.log(`  Projects: ${projectCount}`);
                console.log(`  Stars: ${totalStars}`);
                console.log(`  Streak: ${streak}`);
                console.log('---');
            }
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

getCounts();
