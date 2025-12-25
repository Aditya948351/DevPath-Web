"use client";

import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Gift, Lock } from 'lucide-react';
import { doc, updateDoc, arrayUnion, writeBatch, increment, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { POINTS } from '@/lib/points';
import { calculateUserPointsAndBadges } from '@/lib/point-calculation';
import { useState, useEffect, useRef } from 'react';

// Global throttle to prevent infinite loops even if component remounts
let lastBadgeCheckTime = 0;

export default function Rewards({ user: propUser, projectCount = 0 }: { user?: any, projectCount?: number }) {
    const { user: authUser, updateUserProfile } = useAuth();

    // Use propUser if provided (public view), otherwise authUser (private view)
    const user = propUser || authUser;
    const isOwner = !propUser || (authUser && propUser.uid === authUser.uid);

    const lastCheckedRef = useRef<{ achievements: string[], projectCount: number } | null>(null);



    // Auto-award badges & Sync Points effect
    useEffect(() => {
        if (!isOwner || !user) return;

        // Global throttle: Prevent checks more than once every 5 seconds
        if (Date.now() - lastBadgeCheckTime < 5000) return;

        const checkAndSync = async () => {
            // Check lastBadgeScan from user data (24h throttle)
            const lastScan = user.lastBadgeScan || 0;
            if (Date.now() - lastScan < 24 * 60 * 60 * 1000) {
                console.log("Point sync skipped (less than 24h since last scan).");
                return;
            }

            // Update global throttle
            lastBadgeCheckTime = Date.now();

            try {
                // 1. Fetch User Projects (needed for star count)
                const projectsRef = collection(db, 'members', user.uid, 'projects');
                const projectsSnap = await getDocs(projectsRef);
                const userProjects = projectsSnap.docs.map(doc => doc.data());

                // 2. Calculate Expected Points & Badges
                const result = calculateUserPointsAndBadges(user, userProjects);

                // 3. Compare with current state
                const currentPoints = user.points || 0;
                const currentBadges = user.achievements || [];

                // Check if update needed (points mismatch OR badges mismatch)
                const pointsChanged = result.points !== currentPoints;
                const badgesChanged = JSON.stringify(result.achievements.sort()) !== JSON.stringify(currentBadges.sort());

                if (pointsChanged || badgesChanged) {
                    console.log("Syncing points/badges...", { old: currentPoints, new: result.points });

                    const batch = writeBatch(db);
                    const userRef = doc(db, 'members', user.uid);
                    const leaderboardRef = doc(db, 'leaderboard', user.uid);

                    // Update Member
                    batch.update(userRef, {
                        points: result.points,
                        achievements: result.achievements,
                        lastBadgeScan: Date.now()
                    });

                    // Update Leaderboard
                    batch.set(leaderboardRef, { points: result.points }, { merge: true });

                    // Update Badges Subcollection (Add missing ones)
                    result.achievements.forEach(badgeId => {
                        if (!currentBadges.includes(badgeId)) {
                            const badgeRef = doc(db, 'members', user.uid, 'badges', badgeId);
                            batch.set(badgeRef, {
                                id: badgeId,
                                earnedAt: serverTimestamp(),
                                xpAwarded: POINTS.BADGE_EARNED // Approximate, as we recalc total
                            });
                        }
                    });

                    await batch.commit();

                    // Update local state
                    await updateUserProfile({
                        points: result.points,
                        achievements: result.achievements
                    });

                    if (badgesChanged) {
                        const newCount = result.achievements.length - currentBadges.length;
                        if (newCount > 0) alert(`🎉 You earned new badges and your points have been synchronized!`);
                        else alert(`Your points have been synchronized.`);
                    }
                } else {
                    // Just update timestamp if nothing changed, to reset 24h timer
                    await updateDoc(doc(db, 'members', user.uid), {
                        lastBadgeScan: Date.now()
                    });
                }

            } catch (error) {
                console.error("Error syncing points:", error);
            }
        };

        checkAndSync();
    }, [user, isOwner, updateUserProfile]);

    if (!user) return null;

    const BADGES = [
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
    ];

    return (
        <div className="space-y-8">
            {/* Badges Section */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CheckCircle className="text-blue-500" size={24} /> Badges & Milestones
                </h3>

                {/* Horizontal Scrollable List */}
                <div className="relative group">
                    <div className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 transition-colors">
                        {BADGES.map(badge => {
                            const isUnlocked = user.achievements?.includes(badge.id);
                            return (
                                <div
                                    key={badge.id}
                                    className={`flex-none w-40 p-4 rounded-xl border flex flex-col items-center text-center gap-3 transition-all snap-start ${isUnlocked
                                        ? 'bg-primary/5 border-primary/20 shadow-sm scale-100 opacity-100'
                                        : 'bg-muted/20 border-border/50 opacity-50 grayscale scale-95'
                                        }`}
                                >
                                    <div className={`text-4xl p-4 rounded-full ${isUnlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                                        {badge.icon}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {badge.name}
                                        </h4>
                                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
                                            {badge.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Fade effect on the right to indicate scroll */}
                    <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-card to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
