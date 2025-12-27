"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { LEVELS, POINTS, calculateLevel } from '@/lib/points';
import Image from 'next/image';
import { Flame, Trophy, Star, Users, Award, Shield, Gift, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PathwayPage() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const q = query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(50));
                const snapshot = await getDocs(q);
                let data = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter((user: any) =>
                        user.id !== 'devpathind.community@gmail.com' &&
                        user.email !== 'devpathind.community@gmail.com' &&
                        user.name !== 'Super Admin'
                    );

                // Fix missing names (e.g. Admins)
                const { doc, getDoc, updateDoc, where } = await import('firebase/firestore');

                const updatedData = await Promise.all(data.map(async (entry: any) => {
                    if (!entry.name || entry.name.trim() === '') {
                        try {
                            // 1. Try Members (UID)
                            const memberRef = doc(db, 'members', entry.id);
                            const memberSnap = await getDoc(memberRef);

                            if (memberSnap.exists() && memberSnap.data().name) {
                                const newData = { name: memberSnap.data().name, photoURL: memberSnap.data().photoURL };
                                // Only update local state, do not write to DB as it requires admin permissions
                                return { ...entry, ...newData };
                            }

                            // 2. Try Admins (Query by UID)
                            const adminsQuery = query(collection(db, 'admins'), where('uid', '==', entry.id));
                            const adminsSnap = await getDocs(adminsQuery);

                            if (!adminsSnap.empty) {
                                const adminData = adminsSnap.docs[0].data();
                                if (adminData.name) {
                                    const newData = { name: adminData.name, photoURL: adminData.photoURL || adminData.image };
                                    // Only update local state
                                    return { ...entry, ...newData };
                                }
                            }
                        } catch (err) {
                            console.error(`Error fixing user ${entry.id}:`, err);
                        }
                    }
                    return entry;
                }));

                setLeaderboard(updatedData);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                        The DevPath Pathway
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Earn Dev Points, climb the ranks, and become a Pathfinder. Your journey from Shishya to Master starts here.
                    </p>
                </div>

                {/* User Stats (if logged in) */}
                {user && (
                    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                                        {user.photoURL ? (
                                            <Image src={user.photoURL} alt={user.name || 'User'} width={96} height={96} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                                {user.name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <h2 className="text-2xl font-bold">{user.name}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${calculateLevel(user.points || 0).currentLevel.bg} ${calculateLevel(user.points || 0).currentLevel.color} border ${calculateLevel(user.points || 0).currentLevel.border}`}>
                                        {calculateLevel(user.points || 0).currentLevel.name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Trophy size={16} className="text-yellow-500" />
                                        <span className="font-mono font-bold text-foreground">{user.points || 0}</span> Dev Points
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Flame size={16} className="text-orange-500" />
                                        <span className="font-mono font-bold text-foreground">{user.streak || 0}</span> Day Streak
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="max-w-md">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Progress to {LEVELS[LEVELS.indexOf(calculateLevel(user.points || 0).currentLevel) + 1]?.name || 'Max Level'}</span>
                                        <span>{Math.round(calculateLevel(user.points || 0).progress)}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${calculateLevel(user.points || 0).progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Leaderboard */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <Trophy className="text-yellow-500" />
                            <h2 className="text-2xl font-bold">Leaderboard</h2>
                        </div>

                        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col max-h-[600px]">
                            {loading ? (
                                <div className="p-8 text-center text-muted-foreground">Loading leaderboard...</div>
                            ) : (
                                <div className="overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="bg-muted/50 text-muted-foreground text-sm sticky top-0 z-10 backdrop-blur-sm">
                                            <tr>
                                                <th className="p-4 font-medium">Rank</th>
                                                <th className="p-4 font-medium">Dev</th>
                                                <th className="p-4 font-medium">Level</th>
                                                <th className="p-4 font-medium text-right">Points</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {leaderboard.map((entry, index) => {
                                                const level = calculateLevel(entry.points || 0).currentLevel;
                                                return (
                                                    <tr key={entry.id} className={`hover:bg-muted/50 transition-colors ${user?.uid === entry.id ? 'bg-primary/5' : ''}`}>
                                                        <td className="p-4 font-mono font-bold text-muted-foreground">
                                                            #{index + 1}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                                                    {entry.photoURL ? (
                                                                        <Image src={entry.photoURL} alt={entry.name} width={32} height={32} />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                                                                            {entry.name?.[0]}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="font-medium">{entry.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs px-2 py-1 rounded-full border ${level.color} ${level.bg} ${level.border}`}>
                                                                {level.name}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right font-mono font-bold">
                                                            {entry.points || 0}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Levels & Rules */}
                    <div className="space-y-8">

                        {/* Levels Guide */}
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Award className="text-primary" size={20} />
                                Ranks & Levels
                            </h3>

                            {/* Sanrakshak Card */}
                            <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-black p-6 shadow-lg group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_70%)] animate-pulse"></div>
                                <div className="absolute top-0 right-0 p-3 opacity-20">
                                    <Shield size={80} className="text-emerald-500" />
                                </div>

                                <div className="relative z-10 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            Ultimate Stewardship Role
                                        </span>
                                    </div>

                                    <h4 className="text-2xl font-bold text-emerald-400 font-serif tracking-wide">
                                        Sanrakshak
                                    </h4>

                                    <p className="text-sm text-emerald-100/80 leading-relaxed">
                                        The Sanrakshak is the ultimate steward of the DevPath ecosystem.
                                        This role represents long-term ownership, trust, and responsibility for the platform's vision, governance, and continuity.
                                    </p>

                                    <div className="pt-2 flex items-center gap-2 text-xs font-mono text-emerald-500/70">
                                        <Shield size={12} />
                                        <span>10,000,000+ Dev Points</span>
                                    </div>
                                </div>
                            </div>

                            {/* Other Levels - Horizontal Scroll */}
                            <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                                {LEVELS.slice(0, -1).map((lvl) => (
                                    <div key={lvl.name} className={`flex-shrink-0 w-48 p-4 rounded-lg border ${lvl.border} ${lvl.bg} flex flex-col justify-between items-center hover:scale-[1.02] transition-transform duration-200 snap-center`}>
                                        <span className={`font-bold text-lg ${lvl.color}`}>{lvl.name}</span>
                                        <span className="text-xs font-mono text-muted-foreground mt-2">
                                            {lvl.max === Infinity ? `${lvl.min}+` : `${lvl.min} - ${lvl.max}`} pts
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* How to Earn Points - Moved to bottom */}
                    </div>
                </div>

                {/* How to Earn Points - Full Width */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Star className="text-yellow-500" size={20} />
                        How to Earn Points
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                            <span className="flex items-center gap-2 text-sm"><Flame size={16} className="text-orange-500" /> Daily Login</span>
                            <span className="font-mono font-bold text-sm">+{POINTS.DAILY_LOGIN} (+Streak)</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                            <span className="flex items-center gap-2 text-sm"><Flame size={16} className="text-red-500" /> 7-Day Streak</span>
                            <span className="font-mono font-bold text-sm">+{POINTS.WEEKLY_STREAK_BONUS}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                            <span className="flex items-center gap-2 text-sm"><Users size={16} className="text-blue-500" /> Follow Community</span>
                            <span className="font-mono font-bold text-sm">+{POINTS.FOLLOW_COMMUNITY}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                            <span className="flex items-center gap-2 text-sm"><Award size={16} className="text-purple-500" /> Earn Badge</span>
                            <span className="font-mono font-bold text-sm">+{POINTS.BADGE_EARNED}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                            <span className="flex items-center gap-2 text-sm"><Users size={16} className="text-green-500" /> Gain Follower</span>
                            <span className="font-mono font-bold text-sm">+{POINTS.FOLLOWER_GAINED}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                            <span className="flex items-center gap-2 text-sm"><Star size={16} className="text-yellow-500" /> Project Star</span>
                            <span className="font-mono font-bold text-sm">+{POINTS.PROJECT_STAR}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                            <span className="flex items-center gap-2 text-sm"><Calendar size={16} className="text-pink-500" /> Event Participation</span>
                            <span className="font-mono font-bold text-sm">+{POINTS.EVENT_PARTICIPATION}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                            <span className="flex items-center gap-2 text-sm"><Trophy size={16} className="text-yellow-600" /> Hackathon Win</span>
                            <span className="font-mono font-bold text-sm">+{POINTS.HACKATHON_WIN}</span>
                        </div>
                    </div>
                </div>

                {/* Community Rewards Section */}
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                            <Gift className="text-primary" /> Community Rewards
                        </h2>
                        <p className="text-muted-foreground">Redeem your hard-earned Dev Points for exclusive perks and swag.</p>
                    </div>

                    {/* PHASE 1 */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-primary border-b border-border pb-2">PHASE 1 — RESOURCES & GUIDED LEARNING (FOUNDATION)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: "DevPath Curated Fundamentals Notes", cost: 5000, icon: "📚", desc: "Clean, original notes for DSA, Web, Android, Backend, ML. Focus: concepts + mental models." },
                                { name: "DevPath Practice Set (Domain-based)", cost: 8000, icon: "📝", desc: "Carefully selected problems, tasks, and mini-assignments mapped to one chosen domain." },
                                { name: "DevPath Roadmap + Weekly Plan", cost: 12000, icon: "🗺️", desc: "A realistic roadmap: What to learn, what to build, in what order. Time-bound and outcome-focused." },
                                { name: "Single Guided Project (Chosen Tech Stack)", cost: 20000, icon: "🏗️", desc: "User selects stack. Receives one clear project problem, scope, and expected output." },
                            ].map((reward) => (
                                <div key={reward.name} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 hover:border-primary/50 transition-colors group">
                                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{reward.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-lg">{reward.name}</h3>
                                        <p className="text-sm text-muted-foreground">{reward.desc}</p>
                                    </div>
                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                                        <span className="font-mono font-bold text-primary">{reward.cost.toLocaleString()} pts</span>
                                        <button className="px-3 py-1 text-xs bg-muted hover:bg-primary hover:text-primary-foreground rounded-full transition-colors">
                                            Redeem
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PHASE 2 */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-blue-500 border-b border-border pb-2">PHASE 2 — PROJECTS, MENTORSHIP & CREDIBILITY</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: "Verified Learner Badge", cost: 30000, icon: "🎓", desc: "Awarded after roadmap + task completion. Signals discipline." },
                                { name: "Placement & Interview Prep Resources", cost: 40000, icon: "💼", desc: "Domain-focused: Core concepts, interview traps, what actually matters." },
                                { name: "Project Mentorship – DevPath", cost: 50000, icon: "👨‍🏫", desc: "Mentorship on one project: Direction, architecture decisions, review checkpoints." },
                                { name: "Community Spotlight", cost: 65000, icon: "🚀", desc: "Featured for Project, Learnings, and Execution clarity." },
                                { name: "Verified Builder Badge", cost: 100000, icon: "🛠️", desc: "Earned only after completed project and review approval." },
                            ].map((reward) => (
                                <div key={reward.name} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 hover:border-blue-500/50 transition-colors group">
                                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{reward.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-lg">{reward.name}</h3>
                                        <p className="text-sm text-muted-foreground">{reward.desc}</p>
                                    </div>
                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                                        <span className="font-mono font-bold text-primary">{reward.cost.toLocaleString()} pts</span>
                                        <button className="px-3 py-1 text-xs bg-muted hover:bg-primary hover:text-primary-foreground rounded-full transition-colors">
                                            Redeem
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PHASE 3 */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-purple-500 border-b border-border pb-2">PHASE 3 — PHYSICAL COMMUNITY REWARDS</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: "DevPath Sticker Pack", cost: 125000, icon: "🎨", desc: "Simple, symbolic, low cost." },
                                { name: "DevPath Coffee Cup", cost: 150000, icon: "☕", desc: "Clean branding. Everyday utility." },
                                { name: "DevPath Mouse Pad", cost: 200000, icon: "🖱️", desc: "Desk-level presence. Long-term use." },
                                { name: "DevPath T-Shirt", cost: 300000, icon: "👕", desc: "Not merch. Identity. Limited batches only." },
                                { name: "Laptop Cooling Pad", cost: 400000, icon: "❄️", desc: "Practical reward for people who actually build." },
                                { name: "Free DevPath Event Ticket", cost: 500000, icon: "🎟️", desc: "Access to Workshop, Meetup, or DevPath-hosted event." },
                            ].map((reward) => (
                                <div key={reward.name} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 hover:border-purple-500/50 transition-colors group">
                                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{reward.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-lg">{reward.name}</h3>
                                        <p className="text-sm text-muted-foreground">{reward.desc}</p>
                                    </div>
                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                                        <span className="font-mono font-bold text-primary">{reward.cost.toLocaleString()} pts</span>
                                        <button className="px-3 py-1 text-xs bg-muted hover:bg-primary hover:text-primary-foreground rounded-full transition-colors">
                                            Redeem
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PHASE 4 */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-yellow-500 border-b border-border pb-2">PHASE 4 — PREMIUM PHYSICAL REWARDS (TOP TIER)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: "DevPath Backpack (Premium)", cost: 650000, icon: "🎒", desc: "High-quality backpack. Very limited quantity." },
                                { name: "Mechanical Keyboard / Headset", cost: 800000, icon: "⌨️", desc: "One premium productivity accessory. Utility-focused." },
                                { name: "DevPath Flagship Hardware", cost: 1000000, icon: "🖥️", desc: "External Monitor, Tablet, or Premium accessory. Rare & Symbolic." },
                            ].map((reward) => (
                                <div key={reward.name} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 hover:border-yellow-500/50 transition-colors group">
                                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{reward.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-lg">{reward.name}</h3>
                                        <p className="text-sm text-muted-foreground">{reward.desc}</p>
                                    </div>
                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                                        <span className="font-mono font-bold text-primary">{reward.cost.toLocaleString()} pts</span>
                                        <button className="px-3 py-1 text-xs bg-muted hover:bg-primary hover:text-primary-foreground rounded-full transition-colors">
                                            Redeem
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
