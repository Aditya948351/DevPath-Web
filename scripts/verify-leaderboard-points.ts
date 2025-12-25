
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

async function verifyPoints() {
    console.log("Starting Partial Verification...");
    require('fs').writeFileSync('verification_result.txt', "Starting Partial Verification...\n");
    try {
        const membersRef = collection(db, 'members');
        const snapshot = await getDocs(membersRef);
        console.log(`Found ${snapshot.size} members.`);

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const name = data.name || 'Unknown';

            if (name !== 'Tony Stark' && name !== 'Aditya Patil') continue;

            const uid = doc.id;
            const currentPoints = data.points || 0;

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

            // 3. Calculate Streak Points
            const streak = data.streak || 0;
            const streakPoints = streak * POINTS.STREAK_BONUS_PER_DAY;
            const weeklyBonuses = Math.floor(streak / 7) * POINTS.WEEKLY_STREAK_BONUS;

            // Partial Total (No Projects)
            const partialPoints = badgePoints + followerPoints + streakPoints + weeklyBonuses;

            const logMsg = `User: ${name} (${uid})\n` +
                `  Stored: ${currentPoints}, Partial Calc (No Projects): ${partialPoints}\n` +
                `  Breakdown: Badges=${badgePoints}, Followers=${followerPoints}, Streak=${streakPoints + weeklyBonuses}\n` +
                "-".repeat(30) + "\n";

            console.log(logMsg);
            require('fs').appendFileSync('verification_result.txt', logMsg);
        }
    } catch (error) {
        console.error("Error:", error);
        require('fs').appendFileSync('verification_result.txt', `Error: ${error}\n`);
    }
    process.exit(0);
}

verifyPoints();
