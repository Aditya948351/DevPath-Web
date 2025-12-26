"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { teamMembers } from '@/data/team';
import { Trophy, Flame, Star, Target, MapPin, Link as LinkIcon, Calendar, Phone, LogOut, Camera, Save, X, Github, Instagram, Linkedin, CheckCircle, Share2, Shield, Copy, Check, Plus, Edit3, Users, Globe } from 'lucide-react';
import styles from './Profile.module.css';
import ProjectUploadModal from '@/components/projects/ProjectUploadModal';
import ProjectCard from '@/components/projects/ProjectCard';
import Achievements from '@/components/profile/Achievements';
import Rewards from '@/components/profile/Rewards';
import FollowButton from '@/components/profile/FollowButton';
import LoginHeatmap from '@/components/profile/LoginHeatmap';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateLevel } from '@/lib/points';
import { getEmbedUrl } from '@/lib/utils';

export default function UserProfile() {
    const { user, logout, updateUserProfile } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user?.email === 'devpathind.community@gmail.com') {
            router.push('/ap');
        }
    }, [user, router]);

    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    const [newPhotoURL, setNewPhotoURL] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);

    // Projects State
    const [projects, setProjects] = useState<any[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<any>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    // About / Tech Stack State
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutContent, setAboutContent] = useState(user?.aboutMarkdown || '');
    const [aboutTab, setAboutTab] = useState<'write' | 'preview'>('write');

    // Social Links State
    const [socialLinks, setSocialLinks] = useState({
        github: user?.github || '',
        linkedin: user?.linkedin || '',
        instagram: user?.instagram || ''
    });

    // Followers/Following Modal State
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [modalUsers, setModalUsers] = useState<any[]>([]);
    const [loadingModalUsers, setLoadingModalUsers] = useState(false);

    useEffect(() => {
        if (user?.uid) {
            fetchProjects();
        }
    }, [user?.uid]);

    const fetchProjects = async () => {
        if (!user?.uid) return;
        setLoadingProjects(true);
        try {
            // Try fetching with sort
            try {
                const q = query(
                    collection(db, 'projects'),
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProjects(fetchedProjects);
                checkBadges(fetchedProjects);
            } catch (err: any) {
                // Fallback: If index is missing, fetch unsorted and sort client-side
                if (err.message.includes("index")) {
                    console.warn("Index missing, falling back to client-side sort", err);
                    const q = query(
                        collection(db, 'projects'),
                        where('userId', '==', user.uid)
                    );
                    const snapshot = await getDocs(q);
                    const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    // Sort client-side
                    fetchedProjects.sort((a: any, b: any) => {
                        const dateA = a.createdAt?.seconds || 0;
                        const dateB = b.createdAt?.seconds || 0;
                        return dateB - dateA;
                    });
                    setProjects(fetchedProjects);
                    checkBadges(fetchedProjects);
                } else {
                    throw err;
                }
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoadingProjects(false);
        }
    };

    const checkBadges = async (currentProjects: any[]) => {
        if (!user) return;

        const RISING_STAR_BADGE_ID = 'rising-star';
        // Safety check: ensure achievements array exists
        const hasRisingStarBadge = user.achievements?.includes(RISING_STAR_BADGE_ID);

        // Check for Rising Star Badge (20+ stars on any project)
        const earnedRisingStar = currentProjects.some(p => (p.starCount || 0) >= 20);

        if (earnedRisingStar && !hasRisingStarBadge) {
            try {
                await updateUserProfile({
                    achievements: [...(user.achievements || []), RISING_STAR_BADGE_ID],
                    points: (user.points || 0) + 10
                });
                alert("🎉 Congratulations! You earned the 'Rising Star' badge and 10 XP!");
            } catch (error) {
                console.error("Error awarding badge:", error);
            }
        }
    };

    const handlePrivacyToggle = async (setting: 'showMobile' | 'showLocation' | 'showEmail' | 'showProjects' | 'showRewards' | 'isPublic' | 'showInCommunity') => {
        if (!user) return;
        const currentSettings = user.privacySettings || { showMobile: false, showLocation: true, showEmail: false };
        const newSettings = {
            ...currentSettings,
            [setting]: !currentSettings[setting]
        };
        await updateUserProfile({ privacySettings: newSettings });
    };

    const handleShareProfile = () => {
        if (!user) return;
        const url = `${window.location.origin}/u?uid=${user.uid}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSavePhoto = async () => {
        if (!newPhotoURL.trim()) return;
        setIsSaving(true);
        try {
            await updateUserProfile({ photoURL: newPhotoURL });
            setIsEditingPhoto(false);
            setNewPhotoURL('');
        } catch (error) {
            console.error("Failed to update photo:", error);
            alert("Failed to update profile picture. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAbout = async () => {
        setIsSaving(true);
        try {
            await updateUserProfile({
                aboutMarkdown: aboutContent,
                github: socialLinks.github,
                linkedin: socialLinks.linkedin,
                instagram: socialLinks.instagram
            });
            setIsEditingAbout(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditProject = (project: any) => {
        setProjectToEdit(project);
        setShowProjectModal(true);
    };

    const fetchModalUsers = async (uids: string[]) => {
        if (!uids || uids.length === 0) {
            setModalUsers([]);
            return;
        }
        setLoadingModalUsers(true);
        try {
            // Fetch users one by one (optimization: use 'in' query for batches of 10 if needed)
            const { getDoc } = await import('firebase/firestore');
            const users = await Promise.all(uids.map(async (uid) => {
                const docRef = doc(db, 'members', uid);
                const snap = await getDoc(docRef);
                return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
            }));
            setModalUsers(users.filter(u => u !== null));
        } catch (error) {
            console.error("Error fetching modal users:", error);
        } finally {
            setLoadingModalUsers(false);
        }
    };

    const openFollowers = () => {
        setShowFollowersModal(true);
        fetchModalUsers(user?.followers || []);
    };

    const openFollowing = () => {
        setShowFollowingModal(true);
        fetchModalUsers(user?.following || []);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Please login to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* LEFT SIDEBAR */}
                <aside className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="relative w-64 h-64 md:w-72 md:h-72 lg:w-full lg:h-auto lg:aspect-square mb-4 group">
                            <img
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                alt={user.name || 'User'}
                                className="w-full h-full object-cover rounded-full border-4 border-card shadow-xl"
                            />
                            <button
                                onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                                className="absolute bottom-4 right-4 p-2 bg-card text-foreground rounded-full border border-border shadow-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                                title="Change Avatar"
                            >
                                <Camera size={18} />
                            </button>
                        </div>

                        {isEditingPhoto && (
                            <div className="w-full mb-4 p-3 bg-card border border-border rounded-lg animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="url"
                                    value={newPhotoURL}
                                    onChange={(e) => setNewPhotoURL(e.target.value)}
                                    placeholder="Image URL..."
                                    name="photoURL"
                                    id="photoURL"
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md mb-2"
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleSavePhoto} disabled={isSaving} className="flex-1 bg-primary text-primary-foreground py-1 rounded text-sm">Save</button>
                                    <button onClick={() => setIsEditingPhoto(false)} className="flex-1 bg-muted text-muted-foreground py-1 rounded text-sm">Cancel</button>
                                </div>
                            </div>
                        )}

                        <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
                        <div className="mb-2 flex flex-wrap gap-2">
                            {user.role === 'admin' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                                    <Shield size={12} /> Community Admin
                                </span>
                            )}

                            {(user.communityRole || (user.role === 'admin' && teamMembers.find(m => m.name === user.name))) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                                    <Shield size={12} /> {user.communityRole || teamMembers.find(m => m.name === user.name)?.role}
                                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground text-lg mb-4">@{user.email?.split('@')[0]}</p>

                        <div className="w-full mb-6">
                            <button
                                onClick={() => setIsEditingAbout(true)}
                                className="w-full py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                            >
                                Edit Profile
                            </button>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                            <button onClick={openFollowers} className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                                <Users size={16} />
                                <span className="font-bold text-foreground">{user.followers?.length || 0}</span> followers
                            </button>
                            <button onClick={openFollowing} className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                                <span className="font-bold text-foreground">{user.following?.length || 0}</span> following
                            </button>
                        </div>

                        <div className="space-y-3 w-full text-sm">
                            {(user.city || user.state) && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin size={16} />
                                    <span>{[user.city, user.state].filter(Boolean).join(', ')}</span>
                                </div>
                            )}
                            {user.privacySettings?.showEmail && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <LinkIcon size={16} />
                                    <a href={`mailto:${user.email}`} className="hover:text-primary truncate">{user.email}</a>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar size={16} />
                                <span>Joined Dec 2023</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            {user.github && <a href={user.github} target="_blank" className="text-muted-foreground hover:text-foreground"><Github size={20} /></a>}
                            {user.linkedin && <a href={user.linkedin} target="_blank" className="text-muted-foreground hover:text-foreground"><Linkedin size={20} /></a>}
                            {user.instagram && <a href={user.instagram} target="_blank" className="text-muted-foreground hover:text-foreground"><Instagram size={20} /></a>}
                        </div>
                    </div>

                    {/* Achievements Sidebar Removed as per request */}
                    <div className="pt-6 border-t border-border">
                        <button
                            onClick={() => setShowPrivacyModal(true)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
                        >
                            <Shield size={16} /> Privacy Settings
                        </button>
                        <button
                            onClick={handleShareProfile}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
                        >
                            {copied ? <Check size={16} /> : <Share2 size={16} />} Share Profile
                        </button>
                        <button
                            onClick={() => {
                                logout();
                                window.location.href = '/';
                            }}
                            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="lg:col-span-3 space-y-8">

                    {/* Hero / Intro */}
                    <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Target size={120} />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Hi 👋, I'm {user.name}</h2>

                        {/* Level & Points Display */}
                        <div className="flex items-center gap-3 mb-6">
                            {calculateLevel(user.points || 0).currentLevel.name === 'Sanrakshak' ? (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <Shield size={14} />
                                    Sanrakshak
                                </span>
                            ) : (
                                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${calculateLevel(user.points || 0).currentLevel.bg} ${calculateLevel(user.points || 0).currentLevel.color} border ${calculateLevel(user.points || 0).currentLevel.border}`}>
                                    {calculateLevel(user.points || 0).currentLevel.name}
                                </span>
                            )}
                            <span className="text-muted-foreground text-sm font-mono">
                                {user.points || 0} Dev Points
                            </span>
                        </div>

                        <p className="text-muted-foreground max-w-2xl">
                            {user.bio || "Passionate developer building amazing things. Welcome to my profile!"}
                        </p>
                    </div>

                    {/* Login Heatmap */}
                    <div className="space-y-6">
                        <LoginHeatmap loginDates={user.loginDates} />

                        {/* Activity Line Chart (Simple SVG Implementation) */}
                        <div className="p-6 bg-card border border-border rounded-xl">
                            <h3 className="text-lg font-semibold mb-4">Activity Trends</h3>
                            <div className="h-40 flex items-end justify-between gap-2 px-2">
                                {[...Array(14)].map((_, i) => {
                                    const height = Math.floor(Math.random() * 80) + 20; // Mock data for now
                                    return (
                                        <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all relative group" style={{ height: `${height}%` }}>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 text-xs bg-popover text-popover-foreground px-2 py-1 rounded shadow-md transition-opacity">
                                                {height} XP
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground px-2">
                                <span>14 days ago</span>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>

                    {/* About Me & Tech Stack */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Star className="text-yellow-500" size={20} /> About Me
                            </h3>
                            {!isEditingAbout && (
                                <button onClick={() => setIsEditingAbout(true)} className="text-sm text-primary hover:underline">
                                    <Edit3 size={16} />
                                </button>
                            )}
                        </div>

                        {isEditingAbout ? (
                            <div className="space-y-4">
                                <div className="flex bg-muted rounded-lg p-1 w-fit">
                                    <button onClick={() => setAboutTab('write')} className={`px-3 py-1 text-sm rounded-md ${aboutTab === 'write' ? 'bg-background shadow-sm' : ''}`}>Write</button>
                                    <button onClick={() => setAboutTab('preview')} className={`px-3 py-1 text-sm rounded-md ${aboutTab === 'preview' ? 'bg-background shadow-sm' : ''}`}>Preview</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">GitHub URL</label>
                                        <div className="relative">
                                            <Github size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                            <input
                                                type="url"
                                                value={socialLinks.github}
                                                onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                                                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm"
                                                placeholder="https://github.com/..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">LinkedIn URL</label>
                                        <div className="relative">
                                            <Linkedin size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                            <input
                                                type="url"
                                                value={socialLinks.linkedin}
                                                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                                                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm"
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Instagram URL</label>
                                        <div className="relative">
                                            <Instagram size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                            <input
                                                type="url"
                                                value={socialLinks.instagram}
                                                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm"
                                                placeholder="https://instagram.com/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                {aboutTab === 'write' ? (
                                    <textarea
                                        value={aboutContent}
                                        onChange={(e) => setAboutContent(e.target.value)}
                                        className="w-full min-h-[300px] p-4 bg-background border border-border rounded-lg font-mono text-sm"
                                        placeholder="Markdown supported..."
                                        name="aboutContent"
                                        id="aboutContent"
                                    />
                                ) : (
                                    <div className="min-h-[300px] p-4 bg-background border border-border rounded-lg prose prose-invert max-w-none">
                                        <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>{aboutContent}</ReactMarkdown>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsEditingAbout(false)} className="px-4 py-2 rounded-lg hover:bg-muted">Cancel</button>
                                    <button onClick={handleSaveAbout} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Save</button>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none">
                                <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                                    {user.aboutMarkdown || "No description provided yet."}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>






                    {/* GitHub Stats & Achievements Component */}
                    <Achievements />





                    {/* Projects Section */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Flame className="text-orange-500" size={20} /> Projects
                            </h3>
                            <button
                                onClick={() => {
                                    setProjectToEdit(null);
                                    setShowProjectModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
                            >
                                <Plus size={16} /> New Project
                            </button>
                        </div>

                        {loadingProjects ? (
                            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-border/50 border-dashed">
                                <Target size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No projects yet. Start building!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projects.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        isOwner={true}
                                        onEdit={handleEditProject}
                                        onReadMore={setSelectedProject}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rewards Section (Moved to bottom) */}
                    <Rewards projectCount={projects.length} />
                </main>
            </div>

            {/* Modals */}
            <ProjectUploadModal
                isOpen={showProjectModal}
                onClose={() => {
                    setShowProjectModal(false);
                    setProjectToEdit(null);
                }}
                userId={user.uid}
                userEmail={user.email}
                userName={user.name || 'Anonymous'}
                initialData={projectToEdit}
                onSuccess={() => {
                    fetchProjects();
                    alert(projectToEdit ? "Project updated!" : "Project created!");
                }}
            />

            {showPrivacyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Privacy Settings</h3>
                            <button onClick={() => setShowPrivacyModal(false)}><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            {['showMobile', 'showLocation', 'showEmail', 'showProjects', 'showRewards', 'isPublic', 'showInCommunity'].map((setting) => (
                                <div key={setting} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="capitalize">{setting.replace('show', 'Show ').replace('isPublic', 'Public Profile').replace('showInCommunity', 'Show in Community')}</span>
                                    <input
                                        type="checkbox"
                                        checked={(user.privacySettings as any)?.[setting] ?? (setting === 'showMobile' || setting === 'showEmail' ? false : true)}
                                        onChange={() => handlePrivacyToggle(setting as any)}
                                        className="w-5 h-5 accent-primary"
                                        name={setting}
                                        id={setting}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Followers/Following Modal */}
            {(showFollowersModal || showFollowingModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
                            <h3 className="text-xl font-bold">{showFollowersModal ? 'Followers' : 'Following'}</h3>
                            <button onClick={() => { setShowFollowersModal(false); setShowFollowingModal(false); }}><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 min-h-[200px]">
                            {loadingModalUsers ? (
                                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>
                            ) : modalUsers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No users found.</div>
                            ) : (
                                modalUsers.map(u => (
                                    <div key={u.uid} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                                        <img
                                            src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}&background=random`}
                                            alt={u.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-bold truncate">{u.name}</h4>
                                            <p className="text-xs text-muted-foreground truncate">@{u.email?.split('@')[0]}</p>
                                        </div>
                                        <a href={`/u?uid=${u.uid}`} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20">
                                            View
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Project Details Modal */}
            {selectedProject && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setSelectedProject(null)}
                >
                    <div
                        className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur">
                            <h2 className="text-xl font-bold truncate pr-4">{selectedProject.title}</h2>
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Media */}
                            {selectedProject.videoUrl ? (
                                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                                    <iframe
                                        src={getEmbedUrl(selectedProject.videoUrl)}
                                        className="w-full h-full"
                                        allowFullScreen
                                    />
                                </div>
                            ) : selectedProject.screenshots && selectedProject.screenshots.length > 0 && (
                                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                                    <img
                                        src={selectedProject.screenshots[0]}
                                        alt={selectedProject.title}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}

                            {/* Description */}
                            <div className="prose dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: selectedProject.description }} />
                            </div>

                            {/* Links & Skills */}
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                                {selectedProject.websiteUrl && (
                                    <a
                                        href={selectedProject.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <Globe size={16} /> Visit Website
                                    </a>
                                )}
                                <div className="flex flex-wrap gap-2 ml-auto">
                                    {selectedProject.skills?.map((skill: string) => (
                                        <span key={skill} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
