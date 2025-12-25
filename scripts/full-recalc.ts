
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch, serverTimestamp } from "firebase/firestore";
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

async function fullRecalc() {
    console.log("Starting Full Recalculation (Reset & Recount)...");
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

            // --- 1. RECOUNT BADGES ---
            const newAchievements: string[] = [];

            // Preserve Early Adopter if exists (or we could check creation date if available)
            if (data.achievements?.includes('early-adopter')) {
                newAchievements.push('early-adopter');
            }

            // Profile Perfect
            if (data.name && data.bio && data.photoURL && data.role) {
                newAchievements.push('profile-perfect');
            }

            // Connector (All 3)
            if (data.github && data.linkedin && data.instagram) {
                newAchievements.push('connector-social');
            }

            // Social Badges
            if (data.github) newAchievements.push('social-github');
            if (data.linkedin) newAchievements.push('social-linkedin');
            if (data.instagram) newAchievements.push('social-instagram');

            // Basic Profile
            if (data.bio && data.bio.length > 20) newAchievements.push('storyteller');
            if (data.photoURL) newAchievements.push('face-of-community');
            if (data.city || data.state) newAchievements.push('local-hero');

            // Projects
            const projectsRef = collection(db, 'members', uid, 'projects');
            const projectsSnap = await getDocs(projectsRef);
            const projectCount = projectsSnap.size;
            let totalStars = 0;
            projectsSnap.forEach(p => totalStars += (p.data().stars || []).length);

            if (projectCount >= 1) newAchievements.push('builder-1');
            if (projectCount >= 3) newAchievements.push('builder-3');
            if (projectCount >= 5) newAchievements.push('builder-5');
            if (projectCount >= 10) newAchievements.push('builder-10');

            // Streak
            const streak = data.streak || 0;
            if (streak >= 7) newAchievements.push('streak-7');

            // --- 2. CALCULATE POINTS ---
            let badgePoints = 0;
            newAchievements.forEach((badgeId: string) => {
                if (SOCIAL_BADGES.includes(badgeId)) {
                    badgePoints += POINTS.SOCIAL_BADGE_EARNED;
                } else {
                    badgePoints += POINTS.BADGE_EARNED;
                }
            });

            const followers = data.followers || [];
            const followerPoints = followers.length * POINTS.FOLLOWER_GAINED;
            const projectPoints = (projectCount * 50) + (totalStars * POINTS.PROJECT_STAR);
            const streakPoints = streak * POINTS.STREAK_BONUS_PER_DAY;
            const weeklyBonuses = Math.floor(streak / 7) * POINTS.WEEKLY_STREAK_BONUS;

            const calculatedPoints = badgePoints + followerPoints + projectPoints + streakPoints + weeklyBonuses;

            console.log(`User: ${name} (${uid})`);
            console.log(`  Badges: ${newAchievements.length} (${newAchievements.join(', ')})`);
            console.log(`  Points: ${calculatedPoints}`);

            // Update Member
            const memberRef = doc(db, 'members', uid);
            batch.update(memberRef, {
                points: calculatedPoints,
                achievements: newAchievements,
                lastBadgeScan: Date.now() // Set scan time
            });

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

        console.log("Full Recalculation Complete.");

    } catch (error) {
        console.error("Error recalculating:", error);
    }
    process.exit(0);
}

fullRecalc();
