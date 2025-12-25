"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Star, Award, Target } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getCountFromServer, getDocs } from 'firebase/firestore';

export default function Achievements() {
    const { user } = useAuth();
    const [rank, setRank] = useState<number | null>(null);
    const [projectCount, setProjectCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // 1. Fetch Rank
                if (user.points) {
                    const qRank = query(collection(db, 'leaderboard'), where('points', '>', user.points));
                    const snapshotRank = await getCountFromServer(qRank);
                    setRank(snapshotRank.data().count + 1);
                } else {
                    setRank(null);
                }

                // 2. Fetch Project Count
                const qProjects = query(collection(db, 'projects'), where('userId', '==', user.uid));
                const snapshotProjects = await getCountFromServer(qProjects);
                setProjectCount(snapshotProjects.data().count);

            } catch (error) {
                console.error("Error fetching achievements data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user) return null;

    // Achievements Logic
    // Achievements Logic - Aligned with Rewards.tsx
    const achievementsList = [
        { id: 'early-adopter', name: 'Early Adopter', description: 'Joined during the beta phase.', icon: '🚀' },
        { id: 'profile-perfect', name: 'Profile Perfect', description: 'Completed 100% of profile details.', icon: '✨' },
        { id: 'builder-1', name: 'Builder', description: 'Uploaded first project.', icon: '🛠️' },
        { id: 'builder-3', name: 'Prolific Builder', description: 'Shared 3+ projects.', icon: '🏗️' },
        { id: 'builder-5', name: 'Architect', description: 'Shared 5+ projects.', icon: '🏢' },
        { id: 'builder-10', name: 'Master Builder', description: 'Shared 10+ projects.', icon: '🏰' },
        { id: 'connector-social', name: 'Super Connector', description: 'Connected all social accounts.', icon: '🔗' },
        { id: 'social-github', name: 'Coder', description: 'Linked GitHub account.', icon: '🐙' },
        { id: 'social-linkedin', name: 'Professional', description: 'Linked LinkedIn account.', icon: '💼' },
        { id: 'social-instagram', name: 'Socialite', description: 'Linked Instagram account.', icon: '📸' },
        { id: 'storyteller', name: 'Storyteller', description: 'Wrote a bio.', icon: '✍️' },
        { id: 'face-of-community', name: 'Face of Community', description: 'Uploaded a profile picture.', icon: '😊' },
        { id: 'local-hero', name: 'Local Hero', description: 'Added location details.', icon: '📍' },
        { id: 'streak-7', name: 'Dedicated', description: '7-day login streak.', icon: '🔥' },
        { id: 'top-collaborator', name: 'Top Collaborator', description: 'Active contributor to community projects.', icon: '🤝' },
    ].map(badge => ({
        ...badge,
        earned: user.achievements?.includes(badge.id) || false
    }));

    const earnedCount = achievementsList.filter(a => a.earned).length;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-full">
                        <Star size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{user.points || 0}</div>
                        <div className="text-sm text-muted-foreground">Dev Points</div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-full">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{rank ? `#${rank}` : '-'}</div>
                        <div className="text-sm text-muted-foreground">Global Rank</div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
                        <Award size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{earnedCount}</div>
                        <div className="text-sm text-muted-foreground">Badges Earned</div>
                    </div>
                </div>
            </div>

            {/* Achievements List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievementsList.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${achievement.earned
                            ? 'bg-card border-primary/20 shadow-sm'
                            : 'bg-muted/50 border-border opacity-60 grayscale'
                            }`}
                    >
                        <div className="text-2xl">{achievement.icon}</div>
                        <div>
                            <h3 className="font-bold flex items-center gap-2">
                                {achievement.name}
                                {achievement.earned && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Earned</span>}
                            </h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
