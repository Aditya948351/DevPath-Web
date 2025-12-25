export const POINTS = {
    DAILY_LOGIN: 0, // Base login is 0, streak adds 1
    WEEKLY_STREAK_BONUS: 50,
    FOLLOW_COMMUNITY: 500,
    BADGE_EARNED: 20, // Standard badge
    SOCIAL_BADGE_EARNED: 50, // GitHub, LinkedIn, Instagram
    FOLLOWER_GAINED: 10,
    PROJECT_STAR: 50,
    CREATE_PROJECT: 200,
    CREATE_DISCUSSION: 100,
    EVENT_PARTICIPATION: 500,
    HACKATHON_WIN: 5000,
    STREAK_BONUS_PER_DAY: 1
};

export const LEVELS = [
    { name: 'Shishya', min: 0, max: 5000, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
    { name: 'Abhyasi', min: 5001, max: 15000, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { name: 'Sadhak', min: 15001, max: 35000, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { name: 'Yogi', min: 35001, max: 75000, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { name: 'Amatya', min: 75001, max: 150000, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    { name: 'Senapati', min: 150001, max: 300000, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { name: 'Samrat', min: 300001, max: 750000, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { name: 'Chakravarti', min: 750001, max: 2000000, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { name: 'Rajadhiraj', min: 2000001, max: 5000000, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { name: 'Path-Nirmata', min: 5000001, max: 9999999, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { name: 'Sanrakshak', min: 10000000, max: Infinity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
];

export function calculateLevel(points: number) {
    // Ensure points is a number
    const safePoints = points || 0;
    const level = LEVELS.find(l => safePoints >= l.min && safePoints <= l.max) || LEVELS[LEVELS.length - 1];

    // Calculate progress to next level
    let progress = 0;
    let nextLevelPoints = 0;

    if (level.max !== Infinity) {
        const range = level.max - level.min;
        const current = safePoints - level.min;
        progress = Math.min(100, Math.max(0, (current / range) * 100));
        nextLevelPoints = level.max + 1;
    } else {
        progress = 100; // Max level reached
    }

    return {
        currentLevel: level,
        progress,
        nextLevelPoints
    };
}

export function getPointsForAction(action: keyof typeof POINTS) {
    return POINTS[action] || 0;
}
