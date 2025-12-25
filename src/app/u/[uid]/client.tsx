
"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trophy, Flame, Star, Target, MapPin, Link as LinkIcon, Calendar, Phone, Github, Instagram, Linkedin, CheckCircle, User as UserIcon, Heart, Share2, Video, Image as ImageIcon, Globe, Check, Users, Shield } from 'lucide-react';
import styles from '@/components/profile/Profile.module.css';
import Rewards from '@/components/profile/Rewards';
import FollowButton from '@/components/profile/FollowButton';
import LoginHeatmap from '@/components/profile/LoginHeatmap';

interface PublicUser {
    id?: string;
    name: string;
    photoURL?: string;
    bio?: string;
    role?: string;
    displayRole?: string;
    roleTasks?: string[];
    city?: string;
    state?: string;
    district?: string;
    mobile?: string;
    email?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    privacySettings?: {
        showMobile: boolean;
        showLocation: boolean;
        showEmail: boolean;
        showProjects?: boolean;
        showRewards?: boolean;
        isPublic?: boolean;
        showInCommunity?: boolean;
    };
    createdAt?: any; // Can be string or Timestamp
    followers?: string[];
    following?: string[];
    loginDates?: string[];
    points?: number;
    streak?: number;
    achievements?: string[];
}

interface Project {
    id: string;
    title: string;
    description: string;
    screenshots: string[];
    videoUrl?: string;
    websiteUrl?: string;
    skills?: string[];
    likes: string[];
    createdAt: any;
}

import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfileClient() {
    const params = useParams();
    const { user: currentUser } = useAuth();
    const [uid, setUid] = useState<string | null>(null);
    const [user, setUser] = useState<PublicUser | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Overview');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/');
            const urlUid = pathParts[pathParts.length - 1];
            if (urlUid && urlUid !== 'public') {
                setUid(urlUid);
            } else if (params?.uid && params.uid !== 'public') {
                setUid(params.uid as string);
            }
        }
    }, [params]);

    useEffect(() => {
        const fetchUserAndProjects = async () => {
            if (!uid) return;
            setLoading(true);
            setError('');

            try {
                let userData: PublicUser | undefined;
                let userId = uid;

                // 1. Try fetching by Document ID from 'members'
                let userDoc = await getDoc(doc(db, 'members', uid));

                // 2. If not found, try fetching by 'uid' field query in 'members'
                if (!userDoc.exists()) {
                    const q = query(collection(db, 'members'), where('uid', '==', uid));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        userDoc = querySnapshot.docs[0];
                        userId = userDoc.id;
                    }
                }

                // 3. If still not found, try 'admins' collection
                if (!userDoc.exists()) {
                    userDoc = await getDoc(doc(db, 'admins', uid));
                    if (!userDoc.exists()) {
                        const q = query(collection(db, 'admins'), where('uid', '==', uid));
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            userDoc = querySnapshot.docs[0];
                            userId = userDoc.id;
                        }
                    }
                }

                if (userDoc.exists()) {
                    userData = { id: userId, ...userDoc.data() } as PublicUser;

                    // Privacy Check
                    if (userData.privacySettings?.isPublic === false) {
                        setError('This profile is private.');
                        setLoading(false);
                        return;
                    }

                    // Check if user is an admin (if not already marked)
                    if (userData.role !== 'admin' && userData.email) {
                        const adminCheck = await getDoc(doc(db, 'admins', userData.email));
                        if (adminCheck.exists()) {
                            userData.role = 'admin';
                        }
                    }

                    // Fetch Role Details
                    if ((userData as any).roleId) {
                        const roleDoc = await getDoc(doc(db, 'roles', (userData as any).roleId));
                        if (roleDoc.exists()) {
                            const roleData = roleDoc.data();
                            userData = {
                                ...userData,
                                displayRole: roleData.title,
                                roleTasks: roleData.tasks
                            };
                        }
                    }
                    setUser(userData);

                    // Fetch Projects (Root Collection Query for consistency)
                    const projectsQuery = query(
                        collection(db, 'projects'),
                        where('userId', '==', userId),
                        orderBy('createdAt', 'desc')
                    );

                    try {
                        const projectsSnapshot = await getDocs(projectsQuery);
                        const projectsData = projectsSnapshot.docs.map(doc => {
                            const data = doc.data();
                            return {
                                id: doc.id,
                                ...data,
                                screenshots: data.screenshots || [],
                                likes: data.likes || [],
                                skills: data.skills || []
                            } as Project;
                        });
                        setProjects(projectsData);
                    } catch (err: any) {
                        // Fallback for missing index
                        if (err.message.includes("index")) {
                            const q = query(collection(db, 'projects'), where('userId', '==', userId));
                            const snapshot = await getDocs(q);
                            const projectsData = snapshot.docs.map(doc => {
                                const data = doc.data();
                                return {
                                    id: doc.id,
                                    ...data,
                                    screenshots: data.screenshots || [],
                                    likes: data.likes || [],
                                    skills: data.skills || []
                                } as Project;
                            });
                            projectsData.sort((a, b) => {
                                const dateA = a.createdAt?.seconds ? a.createdAt.seconds : (new Date(a.createdAt || 0).getTime() / 1000);
                                const dateB = b.createdAt?.seconds ? b.createdAt.seconds : (new Date(b.createdAt || 0).getTime() / 1000);
                                return dateB - dateA;
                            });
                            setProjects(projectsData);
                        }
                    }

                } else {
                    setError('User not found.');
                }
            } catch (err) {
                console.error("Error fetching user:", err);
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndProjects();
    }, [uid]);

    const handleShareProfile = async () => {
        const profileUrl = window.location.href;
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleLikeProject = async (projectId: string, currentLikes: string[]) => {
        if (!currentUser) {
            alert("Please login to like projects.");
            return;
        }

        const isLiked = currentLikes.includes(currentUser.uid);
        // Update Root Collection
        const projectRef = doc(db, 'projects', projectId);

        try {
            if (isLiked) {
                await updateDoc(projectRef, {
                    likes: arrayRemove(currentUser.uid)
                });
                setProjects(prev => prev.map(p =>
                    p.id === projectId ? { ...p, likes: p.likes.filter(id => id !== currentUser.uid) } : p
                ));
            } else {
                await updateDoc(projectRef, {
                    likes: arrayUnion(currentUser.uid)
                });
                setProjects(prev => prev.map(p =>
                    p.id === projectId ? { ...p, likes: [...p.likes, currentUser.uid] } : p
                ));
            }
        } catch (error) {
            console.error("Error updating like:", error);
        }
    };

    const handleShareProject = (projectId: string) => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert("Profile link copied!");
    };

    // Helper to safely format date
    const formatDate = (dateValue: any) => {
        if (!dateValue) return 'Dec 2023';
        if (typeof dateValue === 'string') return new Date(dateValue).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (dateValue.seconds) return new Date(dateValue.seconds * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return 'Dec 2023';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                <UserIcon size={64} className="text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
                <p className="text-muted-foreground">{error || "The user you are looking for does not exist."}</p>
            </div>
        );
    }

    const showMobile = user.privacySettings?.showMobile;
    const showLocation = user.privacySettings?.showLocation ?? true;

    return (
        <section className={styles.profile}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.cover} />
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.name || 'User'} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>

                        <div className={styles.details}>
                            <h1 className={styles.name}>{user.name || 'User'}</h1>
                            {user.role === 'admin' && (
                                <div className="mb-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                                        <Shield size={12} /> Community Admin
                                    </span>
                                </div>
                            )}

                            <p className={styles.bio}>
                                <span className="text-primary font-bold">{(user.displayRole || user.role || 'MEMBER').toUpperCase()}</span>
                                {user.bio && <span className="text-muted-foreground"> • {user.bio}</span>}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                                {showLocation && (user.city || user.state) && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} />
                                        {[user.city, user.district, user.state].filter(Boolean).join(', ')}
                                    </span>
                                )}
                                {showMobile && user.mobile && (
                                    <span className="flex items-center gap-1">
                                        <Phone size={14} /> {user.mobile}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} /> Joined {formatDate(user.createdAt)}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-3">
                                {user.github && (
                                    <a href={user.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                                        <Github size={14} /> GitHub
                                    </a>
                                )}
                                {user.linkedin && (
                                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                                        <Linkedin size={14} /> LinkedIn
                                    </a>
                                )}
                                {user.instagram && (
                                    <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                                        <Instagram size={14} /> Instagram
                                    </a>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4">
                                {user.id && <FollowButton targetUserId={user.id} />}
                                <button
                                    onClick={handleShareProfile}
                                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all duration-200 font-medium text-sm"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={16} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Share2 size={16} />
                                            Share
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{user.points || 0}</div>
                        <div className={styles.statLabel}><Star size={14} /> Total XP</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{user.streak || 0}</div>
                        <div className={styles.statLabel}><Flame size={14} /> Day Streak</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{user.followers?.length || 0}</div>
                        <div className={styles.statLabel}><Users size={14} /> Followers</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{user.following?.length || 0}</div>
                        <div className={styles.statLabel}><UserIcon size={14} /> Following</div>
                    </div>
                </div>

                {user.roleTasks && user.roleTasks.length > 0 && (
                    <div className="mt-6 p-6 bg-card rounded-xl border border-border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Target className="text-primary" size={20} />
                            Role Responsibilities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {user.roleTasks.map((task, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                                    <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-sm text-foreground/90">{task}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.tabs}>
                    <div
                        className={`${styles.tab} ${activeTab === 'Overview' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('Overview')}
                    >
                        Overview
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === 'Projects' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('Projects')}
                        style={{ display: user.privacySettings?.showProjects === false ? 'none' : 'block' }}
                    >
                        Projects
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === 'Achievements' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('Achievements')}
                    >
                        Achievements
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === 'Rewards' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('Rewards')}
                        style={{ display: user.privacySettings?.showRewards === false ? 'none' : 'block' }}
                    >
                        Rewards
                    </div>
                </div>

                {activeTab === 'Overview' && (
                    <div className="space-y-6">
                        {/* Contribution Heatmap */}
                        <div>
                            <h2 className={styles.sectionTitle}>Contribution Activity</h2>
                            <LoginHeatmap loginDates={user.loginDates} />
                        </div>
                    </div>
                )}

                {activeTab === 'Projects' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {projects.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-border/50 border-dashed">
                                <Target size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No projects showcased yet.</p>
                            </div>
                        ) : (
                            projects.map(project => (
                                <div key={project.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    {/* Media Display: Screenshots OR Video */}
                                    <div className="aspect-video bg-muted relative group overflow-hidden">
                                        {project.videoUrl ? (
                                            <div className="w-full h-full flex items-center justify-center bg-black/5">
                                                <a
                                                    href={project.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-col items-center gap-2 text-primary hover:scale-105 transition-transform"
                                                >
                                                    <div className="p-3 bg-background rounded-full shadow-lg">
                                                        <Video size={32} />
                                                    </div>
                                                    <span className="text-sm font-medium bg-background/80 px-2 py-1 rounded-md">Watch Video</span>
                                                </a>
                                            </div>
                                        ) : (
                                            <>
                                                {project.screenshots.length > 0 ? (
                                                    <img
                                                        src={project.screenshots[0]}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <ImageIcon size={32} />
                                                    </div>
                                                )}
                                                {project.screenshots.length > 1 && (
                                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                                        +{project.screenshots.length - 1} more
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg line-clamp-1" title={project.title}>{project.title}</h3>
                                            <div className="flex gap-1">
                                                {project.websiteUrl && (
                                                    <a
                                                        href={project.websiteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                        title="Visit Website"
                                                    >
                                                        <Globe size={16} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
                                            {project.description}
                                        </p>

                                        {project.skills && project.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
                                                {project.skills.slice(0, 3).map(skill => (
                                                    <span key={skill} className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-md">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {project.skills.length > 3 && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-md">
                                                        +{project.skills.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-border">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleLikeProject(project.id, project.likes)}
                                                    className={`flex items-center gap-1.5 text-sm transition-colors ${currentUser && project.likes.includes(currentUser.uid) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                                                >
                                                    <Heart size={16} fill={currentUser && project.likes.includes(currentUser.uid) ? "currentColor" : "none"} />
                                                    <span>{project.likes.length}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleShareProject(project.id)}
                                                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <Share2 size={16} />
                                                    <span>Share</span>
                                                </button>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(project.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                {activeTab === 'Achievements' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {user.achievements && user.achievements.length > 0 ? (
                                user.achievements.map((badgeId, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                                        <div className="p-3 bg-primary/10 text-primary rounded-full">
                                            <Trophy size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold capitalize">{badgeId.replace(/-/g, ' ')}</h3>
                                            <p className="text-sm text-muted-foreground">Earned Badge</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-border/50 border-dashed">
                                    <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No achievements yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'Rewards' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <Rewards user={user} />
                    </div>
                )}
            </div >
        </section >
    );
}
