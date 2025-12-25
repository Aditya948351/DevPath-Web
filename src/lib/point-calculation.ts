
import { POINTS } from './points';

export const SOCIAL_BADGES = ['social-github', 'social-linkedin', 'social-instagram'];

export interface UserData {
    uid: string;
    name?: string;
    bio?: string;
    photoURL?: string;
    role?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    city?: string;
    state?: string;
    followers?: string[];
    streak?: number;
    achievements?: string[]; // Existing achievements
}

export interface ProjectData {
    stars?: string[]; // Array of user IDs who starred
}

export function calculateUserPointsAndBadges(user: UserData, projects: ProjectData[]) {
    const newAchievements: string[] = [];

    // --- 1. DETERMINE BADGES ---

    // Preserve Early Adopter if already exists (cannot be re-earned logically if it was time-limited)
    if (user.achievements?.includes('early-adopter')) {
        newAchievements.push('early-adopter');
    }

    // Profile Perfect
    if (user.name && user.bio && user.photoURL && user.role) {
        newAchievements.push('profile-perfect');
    }

    // Connector (All 3)
    if (user.github && user.linkedin && user.instagram) {
        newAchievements.push('connector-social');
    }

    // Social Badges
    if (user.github) newAchievements.push('social-github');
    if (user.linkedin) newAchievements.push('social-linkedin');
    if (user.instagram) newAchievements.push('social-instagram');

    // Basic Profile
    if (user.bio && user.bio.length > 20) newAchievements.push('storyteller');
    if (user.photoURL) newAchievements.push('face-of-community');
    if (user.city || user.state) newAchievements.push('local-hero');

    // Project Badges
    const projectCount = projects.length;
    if (projectCount >= 1) newAchievements.push('builder-1');
    if (projectCount >= 3) newAchievements.push('builder-3');
    if (projectCount >= 5) newAchievements.push('builder-5');
    if (projectCount >= 10) newAchievements.push('builder-10');

    // Streak Badges
    const streak = user.streak || 0;
    if (streak >= 7) newAchievements.push('streak-7');

    // --- 2. CALCULATE POINTS ---

    // Badge Points
    let badgePoints = 0;
    newAchievements.forEach((badgeId: string) => {
        if (SOCIAL_BADGES.includes(badgeId)) {
            badgePoints += POINTS.SOCIAL_BADGE_EARNED;
        } else {
            badgePoints += POINTS.BADGE_EARNED;
        }
    });

    // Follower Points
    const followers = user.followers || [];
    const followerPoints = followers.length * POINTS.FOLLOWER_GAINED;

    // Project Points
    let totalStars = 0;
    projects.forEach(p => {
        totalStars += (p.stars || []).length;
    });
    const projectPoints = (projectCount * 50) + (totalStars * POINTS.PROJECT_STAR);

    // Streak Points
    const streakPoints = streak * POINTS.STREAK_BONUS_PER_DAY;
    const weeklyBonuses = Math.floor(streak / 7) * POINTS.WEEKLY_STREAK_BONUS;

    const totalPoints = badgePoints + followerPoints + projectPoints + streakPoints + weeklyBonuses;

    return {
        points: totalPoints,
        achievements: newAchievements,
        stats: {
            badgePoints,
            followerPoints,
            projectPoints,
            streakPoints,
            weeklyBonuses,
            projectCount,
            totalStars
        }
    };
}
