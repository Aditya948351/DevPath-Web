import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";

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

const POINTS = {
    DAILY_LOGIN: 0,
    WEEKLY_STREAK_BONUS: 50,
    FOLLOW_COMMUNITY: 500,
    BADGE_EARNED: 20,
    SOCIAL_BADGE_EARNED: 50,
    FOLLOWER_GAINED: 10,
    PROJECT_STAR: 50,
    CREATE_PROJECT: 200,
    CREATE_DISCUSSION: 100,
    EVENT_PARTICIPATION: 500,
    HACKATHON_WIN: 5000,
    STREAK_BONUS_PER_DAY: 1
};

async function recalculatePoints() {
    console.log("Starting points recalculation...");
    try {
        const membersRef = collection(db, 'members');
        const snapshot = await getDocs(membersRef);

        console.log(`Found ${snapshot.size} members.`);

        for (const memberDoc of snapshot.docs) {
            const data = memberDoc.data();
            const uid = memberDoc.id;

            console.log(`Processing: ${data.name || uid}`);

            let totalPoints = 0;

            // 1. Projects
            const projectsRef = collection(db, `members/${uid}/projects`);
            const projectsSnapshot = await getDocs(projectsRef);
            const projectCount = projectsSnapshot.size;
            let starCount = 0;
            projectsSnapshot.forEach(p => {
                starCount += (p.data().starCount || 0);
            });

            const projectPoints = projectCount * POINTS.CREATE_PROJECT;
            const starPoints = starCount * POINTS.PROJECT_STAR;
            totalPoints += projectPoints + starPoints;

            // 2. Badges
            const achievements = data.achievements || [];
            let badgePoints = 0;
            achievements.forEach((rawBadgeId: string) => {
                const badgeId = rawBadgeId.trim();
                let pts = POINTS.BADGE_EARNED;
                if (['social-github', 'social-linkedin', 'social-instagram'].includes(badgeId)) {
                    pts = POINTS.SOCIAL_BADGE_EARNED;
                }
                badgePoints += pts;
            });
            totalPoints += badgePoints;

            // 3. Followers
            const followers = data.followers || [];
            const followerPoints = followers.length * POINTS.FOLLOWER_GAINED;
            totalPoints += followerPoints;

            // 4. Activity
            const loginDates = data.loginDates || [];
            const activityPoints = loginDates.length * POINTS.STREAK_BONUS_PER_DAY;
            totalPoints += activityPoints;

            console.log(` > New Points: ${totalPoints}`);

            // Update
            await updateDoc(doc(db, 'members', uid), { points: totalPoints });
            await setDoc(doc(db, 'leaderboard', uid), {
                uid: uid,
                name: data.name,
                photoURL: data.photoURL,
                points: totalPoints,
                role: data.role || 'member',
                lastActive: new Date().toISOString().split('T')[0]
            }, { merge: true });
            console.log(" > Updated DB");
        }
        console.log("Done.");
    } catch (error) {
        console.error("Error:", error);
    }
    process.exit();
}

recalculatePoints();
