
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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
const auth = getAuth(app);

const SUPER_ADMIN_EMAIL = "devpathind.community@gmail.com";
const SUPER_ADMIN_PASSWORD = "Aditya@2006@#";

const POINTS = {
    DAILY_LOGIN: 0,
    WEEKLY_STREAK_BONUS: 50,
    FOLLOW_COMMUNITY: 500,
    BADGE_EARNED: 20,
    SOCIAL_BADGE_EARNED: 50,
    FOLLOWER_GAINED: 10,
    PROJECT_STAR: 50,
    CREATE_PROJECT: 200,
    EVENT_PARTICIPATION: 500,
    HACKATHON_WIN: 5000,
    STREAK_BONUS_PER_DAY: 1
};

const SOCIAL_BADGES = ['social-github', 'social-linkedin', 'social-instagram'];

async function recalculatePoints() {
    console.log("Starting Point Recalculation (Original Values)...");
    try {
        await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
        console.log("Signed in as Super Admin.");

        const membersRef = collection(db, 'members');
        const snapshot = await getDocs(membersRef);
        const batch = writeBatch(db);
        let count = 0;

        console.log(`Found ${snapshot.size} members.`);

        for (const memberDoc of snapshot.docs) {
            const data = memberDoc.data();
            const uid = memberDoc.id;
            const name = data.name || 'Unknown';

            // 1. Calculate Badge Points
            let badgePoints = 0;
            const achievements = data.achievements || [];
            achievements.forEach((badgeId: string) => {
                if (SOCIAL_BADGES.includes(badgeId)) {
                    badgePoints += POINTS.SOCIAL_BADGE_EARNED;
                } else {
                    badgePoints += POINTS.BADGE_EARNED;
                }
            });

            // 2. Calculate Follower Points
            const followers = data.followers || [];
            const followerPoints = followers.length * POINTS.FOLLOWER_GAINED;

            // 3. Calculate Project Points
            // Fetch projects subcollection
            const projectsRef = collection(db, 'members', uid, 'projects');
            const projectsSnap = await getDocs(projectsRef);
            let projectCount = projectsSnap.size;
            let totalStars = 0;
            projectsSnap.forEach(p => {
                totalStars += (p.data().stars || []).length;
            });

            const projectPoints = (projectCount * 50) + (totalStars * POINTS.PROJECT_STAR);

            // 4. Calculate Streak Points
            const streak = data.streak || 0;
            const streakPoints = streak * POINTS.STREAK_BONUS_PER_DAY;
            const weeklyBonuses = Math.floor(streak / 7) * POINTS.WEEKLY_STREAK_BONUS;

            const calculatedPoints = badgePoints + followerPoints + projectPoints + streakPoints + weeklyBonuses;

            console.log(`User: ${name} (${uid})`);
            console.log(`  Old Points: ${data.points} -> New Points: ${calculatedPoints}`);

            // Update Member
            const memberRef = doc(db, 'members', uid);
            batch.update(memberRef, { points: calculatedPoints });

            // Update Leaderboard
            const leaderboardRef = doc(db, 'leaderboard', uid);
            batch.set(leaderboardRef, { points: calculatedPoints }, { merge: true });

            count++;
            if (count % 400 === 0) {
                await batch.commit();
                console.log("Batch committed.");
            }
        }

        if (count % 400 !== 0) {
            await batch.commit();
            console.log("Final batch committed.");
        }

        console.log("Recalculation Complete.");

    } catch (error) {
        console.error("Error recalculating points:", error);
    }
    process.exit(0);
}

recalculatePoints();
