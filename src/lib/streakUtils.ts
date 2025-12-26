// Helper to get date string in IST (UTC+5:30)
function getISTDateString(date: Date = new Date()): string {
    // Offset by 5.5 hours (5 * 60 + 30 = 330 minutes)
    const istOffset = 330 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
}

export function calculateStreak(loginDates: string[] = []) {
    if (!loginDates || !Array.isArray(loginDates) || !loginDates.length) return { currentStreak: 0, maxStreak: 0 };

    const sortedDates = [...new Set(loginDates)].sort();
    let current = 0;
    let max = 0;

    // Check current streak using IST
    const today = getISTDateString(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = getISTDateString(yesterdayDate);

    if (sortedDates.includes(today)) {
        current = 1;
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - 1);

        while (sortedDates.includes(getISTDateString(checkDate))) {
            current++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
    } else if (sortedDates.includes(yesterday)) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - 1);
        let streak = 0;

        while (sortedDates.includes(getISTDateString(checkDate))) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
        current = streak;
    }

    // Max Streak
    let streak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
        if (i > 0) {
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            const diffTime = Math.abs(curr.getTime() - prev.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streak++;
            } else {
                streak = 1;
            }
        } else {
            streak = 1;
        }
        if (streak > max) max = streak;
    }

    return { currentStreak: current, maxStreak: max };
}

export { getISTDateString };
