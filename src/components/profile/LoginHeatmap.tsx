"use client";

import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateStreak, getISTDateString } from '@/lib/streakUtils';

interface LoginHeatmapProps {
    loginDates?: string[];
}

export default function LoginHeatmap({ loginDates = [] }: LoginHeatmapProps) {
    // Ensure loginDates is an array (handle null from Firestore)
    const safeLoginDates = Array.isArray(loginDates) ? loginDates : [];

    // Generate last 365 days
    const days = useMemo(() => {
        const dates = [];
        // We want the grid to end at "Today (IST)"
        // So we start from today and go back 364 days
        const todayIST = new Date();
        // Note: getISTDateString takes a Date object and returns the string YYYY-MM-DD in IST.
        // But here we need to iterate.
        // Let's create a helper or just iterate using the same offset logic.

        for (let i = 364; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(getISTDateString(d));
        }
        return dates;
    }, []);

    // Calculate streaks
    const { currentStreak, maxStreak } = useMemo(() => calculateStreak(safeLoginDates), [safeLoginDates]);

    return (
        <div className="w-full p-4 bg-card border border-border rounded-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Login Activity</h3>
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Current Streak: <strong className="text-foreground">{currentStreak} days</strong></span>
                    <span>Longest Streak: <strong className="text-foreground">{maxStreak} days</strong></span>
                </div>
            </div>

            <div className="flex flex-wrap gap-[2px] justify-center md:justify-start">
                {days.map(date => {
                    const isLoggedIn = safeLoginDates.includes(date);
                    return (
                        <div
                            key={date}
                            title={`${date}: ${isLoggedIn ? 'Logged In' : 'No Activity'}`}
                            className={`w-2.5 h-2.5 rounded-sm transition-colors ${isLoggedIn
                                ? 'bg-green-500 hover:bg-green-400'
                                : 'bg-muted/30 hover:bg-muted/50'
                                }`}
                        />
                    );
                })}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground justify-end">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-sm bg-muted/30" />
                <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                <span>More</span>
            </div>
        </div>
    );
}
