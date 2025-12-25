"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
    Shield, Users, FileText, Settings, Search,
    MoreVertical, Trash2, Eye, Award, Database,
    MessageSquare, Bell, Calendar, Plus, X, Link as LinkIcon, MapPin, Key
} from 'lucide-react';
import {
    collection, query, where, getDocs, doc, updateDoc,
    deleteDoc, getDoc, setDoc, serverTimestamp,
    increment, arrayUnion, arrayRemove, orderBy, limit, addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { calculateUserPointsAndBadges } from '@/lib/point-calculation';

const SUPER_ADMIN_EMAIL = "devpathind.community@gmail.com";
const SUPER_ADMIN_PASSWORD = "Aditya@2006@#";

interface AdminDashboardProps {
    initialAuth?: boolean;
}

export default function AdminDashboard({ initialAuth = false }: AdminDashboardProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('users');

    // Admin Auth State
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(initialAuth);
    const [adminKeyInput, setAdminKeyInput] = useState('');
    const [authError, setAuthError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [newKey, setNewKey] = useState<string | null>(null);

    // Data State
    const [users, setUsers] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    // Loading State
    const [searching, setSearching] = useState(false);
    const [loadingContent, setLoadingContent] = useState(false);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [migrationLog, setMigrationLog] = useState<string[]>([]);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userProjects, setUserProjects] = useState<any[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [viewUser, setViewUser] = useState<any>(null); // For Profile Card Modal
    const [badgeUser, setBadgeUser] = useState<any>(null); // For Badge Management Modal

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Event Modal State
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        image: '',
        registerLink: '',
        organisationName: '',
        opportunityType: 'Workshops & Webinar',
        opportunityCategory: '',
        websiteUrl: '',
        participationType: 'Individual',
        mode: 'Online',
        eligibility: 'Everyone',
        sponsors: [] as { name: string; logo: string; url: string }[]
    });
    const [creatingEvent, setCreatingEvent] = useState(false);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'content') {
            fetchContent();
        } else if (activeTab === 'admins') {
            fetchAdmins();
        } else if (activeTab === 'notifications') {
            fetchNotifications();
        } else if (activeTab === 'events') {
            fetchEvents();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setSearching(true);
        console.log("Fetching users...");
        try {
            const usersRef = collection(db, 'members');
            const snapshot = await getDocs(usersRef);
            console.log(`Found ${snapshot.size} user documents.`);
            const usersList: any[] = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));
            console.log("Users list:", usersList);
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setSearching(false);
        }
    };

    const fetchContent = async () => {
        setLoadingContent(true);
        try {
            // Fetch Projects
            const projectsRef = collection(db, 'projects');
            const projectsSnap = await getDocs(projectsRef);
            const projectsList = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(projectsList);

            // Fetch Discussions
            const discussionsRef = collection(db, 'discussions');
            const discussionsSnap = await getDocs(discussionsRef);
            const discussionsList = discussionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDiscussions(discussionsList);

        } catch (error) {
            console.error("Error fetching content:", error);
        } finally {
            setLoadingContent(false);
        }
    };

    const fetchEvents = async () => {
        setLoadingEvents(true);
        try {
            const q = query(collection(db, 'events'), orderBy('date', 'asc'));
            const snapshot = await getDocs(q);
            const eventsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(eventsList);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingEvent(true);
        try {
            await addDoc(collection(db, 'events'), {
                ...newEvent,
                createdAt: serverTimestamp()
            });

            // Notify Admins
            await addDoc(collection(db, 'admin_notifications'), {
                type: 'event',
                message: `New Event Created: ${newEvent.title}`,
                createdAt: serverTimestamp(),
                read: false
            });

            setShowEventModal(false);
            setShowEventModal(false);
            setNewEvent({
                title: '', description: '', date: '', location: '', image: '', registerLink: '',
                organisationName: '', opportunityType: 'Workshops & Webinar', opportunityCategory: '',
                websiteUrl: '', participationType: 'Individual', mode: 'Online', eligibility: 'Everyone', sponsors: []
            });
            fetchEvents();
            alert("Event created successfully!");
        } catch (error) {
            console.error("Error creating event:", error);
            alert("Failed to create event.");
        } finally {
            setCreatingEvent(false);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await deleteDoc(doc(db, 'events', eventId));
            setEvents(prev => prev.filter(e => e.id !== eventId));
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event.");
        }
    };

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const q = query(collection(db, 'members'), where('role', '==', 'admin'));
            const snapshot = await getDocs(q);
            const adminsList: any[] = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

            // Also fetch from 'admins' collection if separated, but we seem to use 'members' with role='admin' mostly
            // However, AuthContext checks 'admins' collection first. 
            // Let's fetch from 'admins' collection too.
            const adminsColRef = collection(db, 'admins');
            const adminsColSnap = await getDocs(adminsColRef);
            const adminsColList: any[] = adminsColSnap.docs.map(doc => ({ uid: doc.id, ...doc.data(), role: 'admin' }));

            // Merge unique admins
            const allAdmins = [...adminsList];
            adminsColList.forEach(admin => {
                if (!allAdmins.find(a => a.email === admin.email)) {
                    allAdmins.push(admin);
                }
            });

            setAdmins(allAdmins);
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoadingAdmins(false);
        }
    };

    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
            const q = query(collection(db, 'admin_notifications'), orderBy('createdAt', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(notifs);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const handlePromoteToAdmin = async (targetUser: any) => {
        if (!confirm(`Promote ${targetUser.name} to Admin?`)) return;
        try {
            // 1. Update 'members' doc
            await updateDoc(doc(db, 'members', targetUser.uid), { role: 'admin' });

            // 2. Create/Update 'admins' doc (using email as ID per AuthContext logic)
            if (targetUser.email) {
                await setDoc(doc(db, 'admins', targetUser.email), {
                    ...targetUser,
                    role: 'admin',
                    promotedAt: serverTimestamp()
                }, { merge: true });
            }

            alert("User promoted to Admin.");
            fetchUsers(); // Refresh users list
        } catch (error) {
            console.error("Error promoting user:", error);
            alert("Failed to promote user.");
        }
    };

    const handleDemoteToMember = async (targetAdmin: any) => {
        if (targetAdmin.email === SUPER_ADMIN_EMAIL) {
            alert("Cannot remove Super Admin.");
            return;
        }
        if (!confirm(`Demote ${targetAdmin.name} to Member?`)) return;
        try {
            // 1. Update/Create 'members' doc
            // Ensure the user exists in 'members' collection with role 'member'
            if (targetAdmin.uid) {
                await setDoc(doc(db, 'members', targetAdmin.uid), {
                    ...targetAdmin,
                    role: 'member'
                }, { merge: true });
            }

            // 2. Remove from 'admins' collection (by Email)
            if (targetAdmin.email) {
                await deleteDoc(doc(db, 'admins', targetAdmin.email));
            }

            alert("Admin demoted to Member.");
            fetchAdmins(); // Refresh admins list
        } catch (error) {
            console.error("Error demoting admin:", error);
            alert("Failed to demote admin.");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, 'members', userId));
            setUsers(prev => prev.filter(u => u.uid !== userId));
            if (selectedUser?.uid === userId) setSelectedUser(null);
            alert("User deleted successfully.");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };

    const handleUpdateUser = async (userId: string, data: any) => {
        try {
            await updateDoc(doc(db, 'members', userId), data);
            setUsers((prev: any[]) => prev.map(u => u.uid === userId ? { ...u, ...data } : u));
            setSelectedUser((prev: any) => ({ ...prev, ...data }));
            alert("User updated successfully.");
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        }
    };

    const fetchUserProjects = async (userId: string) => {
        setLoadingProjects(true);
        try {
            const projectsRef = collection(db, 'members', userId, 'projects');
            const snapshot = await getDocs(projectsRef);
            const projectsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUserProjects(projectsList);
        } catch (error) {
            console.error("Error fetching user projects:", error);
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleDeleteProject = async (userId: string, projectId: string) => {
        if (!confirm("Delete this project?")) return;
        try {
            await deleteDoc(doc(db, 'members', userId, 'projects', projectId));
            setUserProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Failed to delete project.");
        }
    };

    const handleGlobalDeleteProject = async (projectId: string) => {
        if (!confirm("Delete this project globally?")) return;
        try {
            await deleteDoc(doc(db, 'projects', projectId));
            setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Failed to delete project.");
        }
    };

    const handleDeleteDiscussion = async (discussionId: string) => {
        if (!confirm("Delete this discussion?")) return;
        try {
            await deleteDoc(doc(db, 'discussions', discussionId));
            setDiscussions(prev => prev.filter(d => d.id !== discussionId));
        } catch (error) {
            console.error("Error deleting discussion:", error);
            alert("Failed to delete discussion.");
        }
    };

    const openUserModal = (user: any) => {
        setSelectedUser(user);
        fetchUserProjects(user.uid);
    };


    const handleResetFollowers = async (userId: string) => {
        if (!confirm("Are you sure you want to remove all followers for this user?")) return;
        try {
            await updateDoc(doc(db, 'members', userId), {
                followers: []
            });
            setUsers(prev => prev.map(u => u.uid === userId ? { ...u, followers: [] } : u));
            setSelectedUser((prev: any) => ({ ...prev, followers: [] }));
            alert("Followers reset successfully.");
        } catch (error) {
            console.error("Error resetting followers:", error);
            alert("Failed to reset followers.");
        }
    };

    const toggleBadge = async (targetUser: any, badgeId: string, points: number) => {
        if (!targetUser) return;

        const hasBadge = targetUser.achievements?.includes(badgeId);
        const userRef = doc(db, 'members', targetUser.uid);
        const badgeRef = doc(db, 'earned_badges', `${targetUser.uid}_${badgeId}`);
        const leaderboardRef = doc(db, 'leaderboard', targetUser.uid);

        try {
            if (hasBadge) {
                // Revoke
                await updateDoc(userRef, {
                    achievements: arrayRemove(badgeId),
                    points: increment(-points)
                });
                await deleteDoc(badgeRef);
                await setDoc(leaderboardRef, { points: increment(-points) }, { merge: true });

                // Update local state
                setBadgeUser((prev: any) => prev ? {
                    ...prev,
                    achievements: prev.achievements?.filter((id: string) => id !== badgeId),
                    points: (prev.points || 0) - points
                } : null);

                // Update users list
                setUsers((prev: any[]) => prev.map(u => u.uid === targetUser.uid ? {
                    ...u,
                    achievements: u.achievements?.filter((id: string) => id !== badgeId),
                    points: (u.points || 0) - points
                } : u));

            } else {
                // Award
                await updateDoc(userRef, {
                    achievements: arrayUnion(badgeId),
                    points: increment(points)
                });
                await setDoc(badgeRef, {
                    userId: targetUser.uid,
                    badgeId,
                    awardedAt: serverTimestamp(),
                    awardedBy: 'admin'
                });
                await setDoc(leaderboardRef, { points: increment(points) }, { merge: true });

                // Update local state
                setBadgeUser((prev: any) => prev ? {
                    ...prev,
                    achievements: [...(prev.achievements || []), badgeId],
                    points: (prev.points || 0) + points
                } : null);

                // Update users list
                setUsers((prev: any[]) => prev.map(u => u.uid === targetUser.uid ? {
                    ...u,
                    achievements: [...(u.achievements || []), badgeId],
                    points: (u.points || 0) + points
                } : u));
            }
        } catch (error) {
            console.error("Error toggling badge:", error);
            alert("Failed to update badge.");
        }
    };

    const handleMigrateProjects = async () => {
        if (!confirm("Start Project Migration? This will copy all projects to user subcollections.")) return;

        setMigrating(true);
        setMigrationLog(['Starting migration...']);

        try {
            const projectsRef = collection(db, 'projects');
            const snapshot = await getDocs(projectsRef);

            setMigrationLog((prev: string[]) => [...prev, `Found ${snapshot.size} projects.`]);

            let success = 0;
            let skipped = 0;
            let errors = 0;

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();
                const projectId = docSnap.id;
                const userId = data.userId;

                if (!userId) {
                    setMigrationLog((prev: string[]) => [...prev, `Skipping project ${projectId}: No userId`]);
                    skipped++;
                    continue;
                }

                try {
                    const targetRef = doc(db, 'members', userId, 'projects', projectId);
                    const targetSnap = await getDoc(targetRef);

                    if (targetSnap.exists()) {
                        setMigrationLog((prev: string[]) => [...prev, `Project ${projectId} already exists. Skipping.`]);
                        skipped++;
                    } else {
                        await setDoc(targetRef, data);
                        setMigrationLog((prev: string[]) => [...prev, `Migrated ${projectId} to user ${userId}`]);
                        success++;
                    }
                } catch (err) {
                    console.error(err);
                    setMigrationLog((prev: string[]) => [...prev, `Error migrating ${projectId}`]);
                    errors++;
                }
            }

            setMigrationLog((prev: string[]) => [...prev, `Migration Complete. Success: ${success}, Skipped: ${skipped}, Errors: ${errors}`]);
            alert(`Migration Complete!\nSuccess: ${success}\nSkipped: ${skipped}\nErrors: ${errors}`);

        } catch (error) {
            console.error("Migration failed:", error);
            setMigrationLog((prev: string[]) => [...prev, `Fatal Error: ${error}`]);
            alert("Migration failed. Check console.");
        } finally {
            setMigrating(false);
        }
    };

    const handleRecalculateAll = async () => {
        if (!confirm("Are you sure you want to RECALCULATE ALL BADGES & POINTS for ALL USERS? This disregards the 24h limit.")) return;

        setMigrating(true);
        setMigrationLog(['Starting Full Recalculation...']);

        try {
            const membersRef = collection(db, 'members');
            const snapshot = await getDocs(membersRef);
            const batch = (await import('firebase/firestore')).writeBatch(db);
            let count = 0;
            let batchCount = 0;

            setMigrationLog((prev: string[]) => [...prev, `Found ${snapshot.size} members.`]);

            for (const memberDoc of snapshot.docs) {
                const data = memberDoc.data();
                const uid = memberDoc.id;

                // Fetch Projects for this user
                const projectsRef = collection(db, 'members', uid, 'projects');
                const projectsSnap = await getDocs(projectsRef);
                const userProjects = projectsSnap.docs.map(doc => doc.data());

                // Calculate using shared logic
                const result = calculateUserPointsAndBadges({ uid, ...data }, userProjects);

                // Update Member
                const memberRef = doc(db, 'members', uid);
                batch.update(memberRef, {
                    points: result.points,
                    achievements: result.achievements,
                    lastBadgeScan: Date.now() // Reset scan time
                });

                // Update Leaderboard
                const leaderboardRef = doc(db, 'leaderboard', uid);
                batch.set(leaderboardRef, { points: result.points }, { merge: true });

                count++;
                batchCount++;
                if (batchCount >= 400) {
                    await batch.commit();
                    setMigrationLog((prev: string[]) => [...prev, `Processed ${count} users...`]);
                    batchCount = 0;
                }
            }

            // Commit remaining
            if (batchCount > 0) {
                await batch.commit();
            }

            setMigrationLog((prev: string[]) => [...prev, `Recalculation Complete. Processed ${count} users.`]);
            alert("Recalculation Complete!");

        } catch (error) {
            console.error("Recalculation failed:", error);
            setMigrationLog((prev: string[]) => [...prev, `Fatal Error: ${error}`]);
            alert("Recalculation failed.");
        } finally {
            setMigrating(false);
        }
    };

    // Check for existing session or regular admin status
    useEffect(() => {
        const checkStatus = async () => {
            if (!user) return;
            if (isAdminAuthenticated) return;

            // 1. If Super Admin, check session key
            if (user.email === SUPER_ADMIN_EMAIL) {
                const sessionKey = sessionStorage.getItem('admin_session_key');
                if (sessionKey) {
                    verifyAdminKey(sessionKey, true);
                }
                return;
            }

            // 2. If Regular Admin, check 'admins' collection and bypass key
            try {
                // Check 'admins' collection (ID is email)
                const adminDoc = await getDoc(doc(db, 'admins', user.email!));
                if (adminDoc.exists()) {
                    setIsAdminAuthenticated(true);
                    return;
                }

                // Also check 'members' collection for role='admin' (fallback)
                const memberDoc = await getDoc(doc(db, 'members', user.uid));
                if (memberDoc.exists() && memberDoc.data().role === 'admin') {
                    setIsAdminAuthenticated(true);
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
            }
        };

        checkStatus();
    }, [user, isAdminAuthenticated]);

    const verifyAdminKey = async (key: string, isAuto = false) => {
        const trimmedKey = key.trim();
        if (!trimmedKey) return;
        setVerifying(true);
        setAuthError('');
        try {
            // Check if key matches value in superadmin_keys/config
            const keyDoc = await getDoc(doc(db, 'superadmin_keys', 'config'));

            if (keyDoc.exists() && keyDoc.data().value === trimmedKey) {
                // Auto-login as Super Admin if not already logged in as such
                if (!auth.currentUser || auth.currentUser.email !== SUPER_ADMIN_EMAIL) {
                    try {
                        await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
                    } catch (loginError: any) {
                        console.error("Auto-login failed:", loginError);
                        setAuthError(`Auto-login failed: ${loginError.message}`);
                        alert(`Warning: Could not sign in as Super Admin. You may not be able to edit content.\nError: ${loginError.message}`);
                    }
                }

                setIsAdminAuthenticated(true);
                sessionStorage.setItem('admin_session_key', trimmedKey);

                // Rotate Key if not auto-login (fresh login)
                if (!isAuto) {
                    const newAdminKey = `devpath-admin-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;

                    // Update Key
                    await setDoc(doc(db, 'superadmin_keys', 'config'), {
                        value: newAdminKey,
                        updatedAt: new Date().toISOString(),
                        updatedBy: 'system_rotation'
                    });

                    // Log Notification
                    await addDoc(collection(db, 'admin_notifications'), {
                        type: 'security',
                        message: 'Admin Key rotated automatically after login.',
                        createdAt: serverTimestamp(),
                        read: false
                    });

                    // Update Session
                    sessionStorage.setItem('admin_session_key', newAdminKey);
                    setNewKey(newAdminKey);
                }

            } else {
                if (!isAuto) setAuthError('Invalid Admin Key');
                sessionStorage.removeItem('admin_session_key');
            }
        } catch (error) {
            console.error("Error verifying admin key:", error);
            setAuthError('Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        verifyAdminKey(adminKeyInput);
    };

    if (user === undefined) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // If not authenticated, show login screen
    if (!isAdminAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <Shield className="text-primary w-16 h-16" />
                    </div>
                    <h1 className="text-2xl font-bold text-center mb-2">Admin Access</h1>
                    <p className="text-muted-foreground text-center mb-6">Enter your security key to continue.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={adminKeyInput}
                                onChange={(e) => setAdminKeyInput(e.target.value)}
                                placeholder="Enter Admin Key"
                                className="w-full p-3 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                            />
                        </div>
                        {authError && (
                            <div className="text-red-500 text-sm text-center">{authError}</div>
                        )}
                        <button
                            type="submit"
                            disabled={verifying}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {verifying ? 'Verifying...' : 'Access Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter((u: any) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 px-4 md:px-8 relative">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Shield className="text-red-500" size={32} />
                    <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                </div>

                {/* DEBUG PANEL - REMOVE IN PRODUCTION */}
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm font-mono">
                    <p><strong>Debug Info:</strong></p>
                    <p>Auth User: {auth.currentUser?.email || 'None'} ({auth.currentUser?.uid})</p>
                    <p>Is Super Admin: {auth.currentUser?.email === SUPER_ADMIN_EMAIL ? 'Yes' : 'No'}</p>
                    <p>Admin Key Verified: {isAdminAuthenticated ? 'Yes' : 'No'}</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-border">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-2 px-4 font-medium ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-2 px-4 font-medium ${activeTab === 'content' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                    >
                        Content Moderation
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`pb-2 px-4 font-medium ${activeTab === 'events' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                    >
                        Events
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`pb-2 px-4 font-medium ${activeTab === 'system' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                    >
                        System & Maintenance
                    </button>
                    {user?.email === SUPER_ADMIN_EMAIL && (
                        <>
                            <button
                                onClick={() => setActiveTab('admins')}
                                className={`pb-2 px-4 font-medium ${activeTab === 'admins' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                            >
                                Manage Admins
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`pb-2 px-4 font-medium ${activeTab === 'notifications' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                            >
                                Notifications
                            </button>
                        </>
                    )}
                </div>

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Bell size={20} /> System Notifications
                        </h2>
                        {loadingNotifications ? (
                            <div>Loading...</div>
                        ) : (
                            <div className="space-y-2">
                                {notifications.map(n => (
                                    <div key={n.id} className="p-4 bg-card border border-border rounded-lg flex items-start gap-3">
                                        <div className="mt-1">
                                            {n.type === 'security' ? <Shield size={16} className="text-blue-500" /> : <Bell size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-sm">{n.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {notifications.length === 0 && <div className="text-muted-foreground">No notifications.</div>}
                            </div>
                        )}
                    </div>
                )}

                {/* User Management Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                                Total Users: {users.length}
                            </div>
                        </div>

                        {searching ? (
                            <div className="text-center py-12">Loading users...</div>
                        ) : (
                            <div className="bg-card border border-border rounded-lg overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="p-4 font-medium">User</th>
                                            <th className="p-4 font-medium">Role</th>
                                            <th className="p-4 font-medium">Points</th>
                                            <th className="p-4 font-medium">Joined</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredUsers.map((u: any) => (
                                            <tr key={u.uid} className="hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                            {u.photoURL ? (
                                                                <Image src={u.photoURL} alt={u.name} width={32} height={32} className="rounded-full" />
                                                            ) : (
                                                                u.name?.[0]?.toUpperCase() || 'U'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{u.name}</div>
                                                            <div className="text-xs text-muted-foreground">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.email === SUPER_ADMIN_EMAIL ? 'bg-red-500/20 text-red-500' :
                                                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-500' :
                                                            'bg-blue-500/20 text-blue-500'
                                                        }`}>
                                                        {u.email === SUPER_ADMIN_EMAIL ? 'Super Admin' : u.role === 'admin' ? 'Admin' : 'Member'}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono">{u.points || 0}</td>
                                                <td className="p-4 text-muted-foreground">
                                                    {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setViewUser(u)}
                                                            className="p-2 hover:bg-muted rounded-md text-primary"
                                                            title="View Profile Card"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setBadgeUser(u)}
                                                            className="p-2 hover:bg-muted rounded-md text-yellow-500"
                                                            title="Manage Badges"
                                                        >
                                                            <Award size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => openUserModal(u)}
                                                            className="p-2 hover:bg-muted rounded-md text-blue-500"
                                                            title="Edit User"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>
                                                        {u.email !== SUPER_ADMIN_EMAIL && (
                                                            <button
                                                                onClick={() => handleDeleteUser(u.uid)}
                                                                className="p-2 hover:bg-muted rounded-md text-red-500"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                {/* Super Admin Actions */}
                                                {user?.email === SUPER_ADMIN_EMAIL && u.role !== 'admin' && (
                                                    <td className="p-4 w-10">
                                                        <button
                                                            onClick={() => handlePromoteToAdmin(u)}
                                                            className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-md transition-colors"
                                                            title="Promote to Admin"
                                                        >
                                                            <Shield size={18} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Content Moderation Tab */}
                {activeTab === 'content' && (
                    <div className="space-y-8">
                        {loadingContent ? (
                            <div className="text-center py-12">Loading content...</div>
                        ) : (
                            <>
                                {/* Projects Section */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <FileText size={20} /> All Projects
                                    </h2>
                                    <div className="bg-card border border-border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-muted text-muted-foreground sticky top-0">
                                                <tr>
                                                    <th className="p-4 font-medium">Title</th>
                                                    <th className="p-4 font-medium">Author</th>
                                                    <th className="p-4 font-medium">Date</th>
                                                    <th className="p-4 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {projects.map(p => (
                                                    <tr key={p.id} className="hover:bg-muted/50">
                                                        <td className="p-4 font-medium">{p.title}</td>
                                                        <td className="p-4 text-muted-foreground">{p.authorName || 'Unknown'}</td>
                                                        <td className="p-4 text-muted-foreground">
                                                            {p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <button
                                                                onClick={() => handleGlobalDeleteProject(p.id)}
                                                                className="text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors"
                                                                title="Delete Project"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Discussions Section */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <MessageSquare size={20} /> Recent Discussions
                                    </h2>
                                    <div className="bg-card border border-border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-muted text-muted-foreground sticky top-0">
                                                <tr>
                                                    <th className="p-4 font-medium">Topic</th>
                                                    <th className="p-4 font-medium">Author</th>
                                                    <th className="p-4 font-medium">Date</th>
                                                    <th className="p-4 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {discussions.map(d => (
                                                    <tr key={d.id} className="hover:bg-muted/50">
                                                        <td className="p-4 font-medium truncate max-w-xs">{d.title || d.content?.substring(0, 50)}</td>
                                                        <td className="p-4 text-muted-foreground">{d.authorName || 'Unknown'}</td>
                                                        <td className="p-4 text-muted-foreground">
                                                            {d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <button
                                                                onClick={() => handleDeleteDiscussion(d.id)}
                                                                className="text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors"
                                                                title="Delete Discussion"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* System Tab */}
                {
                    activeTab === 'system' && (
                        <div className="space-y-8">
                            <div className="p-6 bg-card border border-border rounded-lg">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Database size={20} /> Data Migration
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    Use this tool to migrate old projects from the root `projects` collection to the new `members/{'{'}userId{'}'}/projects` subcollection structure.
                                </p>

                                <button
                                    onClick={handleMigrateProjects}
                                    disabled={migrating}
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50"
                                >
                                    {migrating ? 'Migrating...' : 'Start Project Migration'}
                                </button>

                                {migrationLog.length > 0 && (
                                    <div className="mt-6 p-4 bg-muted rounded-md max-h-60 overflow-y-auto font-mono text-xs">
                                        {migrationLog.map((log, i) => (
                                            <div key={i}>{log}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-card border border-border rounded-lg">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Shield size={20} /> System Integrity
                                </h2>
                                <div className="space-y-6">
                                    <div className="p-4 border border-border rounded bg-muted/20">
                                        <h4 className="font-semibold mb-2">Database Refresh</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Normalize user data (ensure points, streak, followers fields exist) and refresh the leaderboard.
                                        </p>
                                        <button
                                            onClick={async () => {
                                                if (!confirm("Start DB Refresh? This will normalize all user documents.")) return;
                                                setMigrating(true);
                                                try {
                                                    alert("This feature is placeholder. Run the script manually for now.");
                                                } finally {
                                                    setMigrating(false);
                                                }
                                            }}
                                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
                                        >
                                            Refresh Database
                                        </button>
                                    </div>

                                    <div className="p-4 border border-border rounded bg-muted/20">
                                        <h4 className="font-semibold mb-2">Full Recalculation (Super Admin)</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Recalculate points and badges for ALL users. <br />
                                            <span className="text-red-500 font-bold">Disregards 24h limit. High Database Usage.</span>
                                        </p>
                                        <button
                                            onClick={handleRecalculateAll}
                                            disabled={migrating}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold"
                                        >
                                            {migrating ? 'Recalculating...' : 'Recalculate All Badges & Points'}
                                        </button>
                                    </div>

                                    {migrationLog.length > 0 && (
                                        <div className="mt-4 p-4 bg-black/80 text-green-400 font-mono text-xs rounded h-48 overflow-y-auto">
                                            {migrationLog.map((log, i) => (
                                                <div key={i}>{log}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Admins Tab */}
                {activeTab === 'admins' && user?.email === SUPER_ADMIN_EMAIL && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Shield size={20} /> Manage Admins
                        </h2>
                        {loadingAdmins ? (
                            <div>Loading admins...</div>
                        ) : (
                            <div className="bg-card border border-border rounded-lg overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="p-4 font-medium">Admin</th>
                                            <th className="p-4 font-medium">Email</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {admins.map(admin => (
                                            <tr key={admin.uid || admin.email} className="hover:bg-muted/50">
                                                <td className="p-4 font-medium">{admin.name}</td>
                                                <td className="p-4 text-muted-foreground">{admin.email}</td>
                                                <td className="p-4 text-right">
                                                    {admin.email !== SUPER_ADMIN_EMAIL && (
                                                        <button
                                                            onClick={() => handleDemoteToMember(admin)}
                                                            className="text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors"
                                                            title="Demote to Member"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Calendar size={20} /> Manage Events
                            </h2>
                            <button
                                onClick={() => setShowEventModal(true)}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                <Plus size={18} /> Add Event
                            </button>
                        </div>

                        {loadingEvents ? (
                            <div className="text-center py-12">Loading events...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map(event => (
                                    <div key={event.id} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                                        <div
                                            className="h-40 bg-muted bg-cover bg-center"
                                            style={{ backgroundImage: event.image ? `url(${event.image})` : undefined }}
                                        >
                                            {!event.image && <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Calendar size={32} /></div>}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg line-clamp-1">{event.title}</h3>
                                                <button
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{event.description}</p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar size={14} />
                                                    {new Date(event.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin size={14} />
                                                    {event.location || 'Online'}
                                                </div>
                                                {event.registerLink && (
                                                    <div className="flex items-center gap-2 text-blue-500">
                                                        <LinkIcon size={14} />
                                                        <a href={event.registerLink} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                                                            Registration Link
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-muted-foreground bg-card border border-border rounded-lg">
                                        No events found. Create one to get started.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* View User Modal (Profile Card) */}
                {viewUser && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-purple-500/20" />
                            <button onClick={() => setViewUser(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
                                <X size={24} />
                            </button>
                            <div className="relative pt-12 text-center">
                                <div className="w-24 h-24 rounded-full bg-background p-1 mx-auto mb-4 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                        {viewUser.photoURL ? (
                                            <Image src={viewUser.photoURL} alt={viewUser.name} width={96} height={96} className="object-cover" />
                                        ) : (
                                            <span className="text-4xl font-bold text-muted-foreground">{viewUser.name?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold">{viewUser.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{viewUser.email}</p>
                                <div className="flex justify-center gap-4 mb-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">{viewUser.points || 0}</div>
                                        <div className="text-xs text-muted-foreground">Points</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-500">{viewUser.achievements?.length || 0}</div>
                                        <div className="text-xs text-muted-foreground">Badges</div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewUser.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'
                                        }`}>
                                        {viewUser.role === 'admin' ? 'Admin' : 'Member'}
                                    </span>
                                    {viewUser.email === SUPER_ADMIN_EMAIL && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500">Super Admin</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {selectedUser && !viewUser && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Edit User</h2>
                                <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={selectedUser.name || ''}
                                        onChange={e => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                        className="w-full p-2 bg-muted border border-border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={selectedUser.email || ''}
                                        className="w-full p-2 bg-muted/50 border border-border rounded-md text-muted-foreground cursor-not-allowed"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Role</label>
                                        <select
                                            value={selectedUser.role || 'member'}
                                            onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Points</label>
                                        <input
                                            type="number"
                                            value={selectedUser.points || 0}
                                            onChange={e => setSelectedUser({ ...selectedUser, points: parseInt(e.target.value) || 0 })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-2">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="px-4 py-2 hover:bg-muted rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleUpdateUser(selectedUser.uid, {
                                            name: selectedUser.name,
                                            role: selectedUser.role,
                                            points: selectedUser.points
                                        })}
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
                                    >
                                        Save Changes
                                    </button>
                                </div>

                                {/* User Projects Section */}
                                <div className="border-t border-border pt-6 mt-6">
                                    <h3 className="font-semibold mb-4">User Projects</h3>
                                    {loadingProjects ? (
                                        <div className="text-center py-4">Loading projects...</div>
                                    ) : userProjects.length > 0 ? (
                                        <div className="space-y-2">
                                            {userProjects.map(p => (
                                                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                    <span className="font-medium truncate flex-1">{p.title}</span>
                                                    <button
                                                        onClick={() => handleDeleteProject(selectedUser.uid, p.id)}
                                                        className="text-red-500 hover:bg-red-500/10 p-2 rounded"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted-foreground">No projects found.</div>
                                    )}
                                </div>

                                <div className="border-t border-border pt-6 mt-6">
                                    <h3 className="font-semibold mb-4 text-red-500">Danger Zone</h3>
                                    <button
                                        onClick={() => handleResetFollowers(selectedUser.uid)}
                                        className="w-full p-2 border border-red-500/50 text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
                                    >
                                        Reset Followers
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Badge Management Modal */}
                {badgeUser && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Award className="text-yellow-500" />
                                    Manage Badges
                                </h2>
                                <button onClick={() => setBadgeUser(null)} className="text-muted-foreground hover:text-foreground">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-muted-foreground">User</p>
                                <p className="font-medium text-lg">{badgeUser.name}</p>
                                <p className="text-xs text-muted-foreground">{badgeUser.email}</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { id: 'social-github', label: 'GitHub Social', points: 50 },
                                    { id: 'social-linkedin', label: 'LinkedIn Social', points: 50 },
                                    { id: 'social-instagram', label: 'Instagram Social', points: 50 }
                                ].map(badge => {
                                    const hasBadge = badgeUser.achievements?.includes(badge.id);
                                    return (
                                        <div key={badge.id} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                                            <div>
                                                <p className="font-medium">{badge.label}</p>
                                                <p className="text-xs text-muted-foreground">{badge.points} Points</p>
                                            </div>
                                            <button
                                                onClick={() => toggleBadge(badgeUser, badge.id, badge.points)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${hasBadge
                                                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                    : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    }`}
                                            >
                                                {hasBadge ? 'Revoke' : 'Award'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* New Key Modal */}
                {newKey && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Key size={32} />
                                </div>
                                <h2 className="text-2xl font-bold">New Security Key Generated</h2>
                                <p className="text-muted-foreground mt-2">
                                    Your admin key has been rotated for security. Please save this new key immediately.
                                </p>
                            </div>

                            <div className="bg-muted p-4 rounded-lg border border-border mb-6 break-all font-mono text-center text-lg select-all">
                                {newKey}
                            </div>

                            <button
                                onClick={() => setNewKey(null)}
                                className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold hover:opacity-90 transition-opacity"
                            >
                                I have saved the key
                            </button>
                        </div>
                    </div>
                )}

                {/* Create Event Modal */}
                {showEventModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Create New Event</h2>
                                <button onClick={() => setShowEventModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateEvent} className="space-y-4">
                                {/* Basic Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Event Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={newEvent.title}
                                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                            placeholder="e.g., Weekly Coding Challenge"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Organisation Name</label>
                                        <input
                                            type="text"
                                            value={newEvent.organisationName}
                                            onChange={e => setNewEvent({ ...newEvent, organisationName: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                            placeholder="e.g., DevPath"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Website URL</label>
                                        <input
                                            type="url"
                                            value={newEvent.websiteUrl}
                                            onChange={e => setNewEvent({ ...newEvent, websiteUrl: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                {/* Opportunity Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Opportunity Type</label>
                                        <select
                                            value={newEvent.opportunityType}
                                            onChange={e => setNewEvent({ ...newEvent, opportunityType: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                        >
                                            <option>Workshops & Webinar</option>
                                            <option>Hackathon</option>
                                            <option>Coding Challenge</option>
                                            <option>Quizzes</option>
                                            <option>Cultural Event</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Category (Tags)</label>
                                        <input
                                            type="text"
                                            value={newEvent.opportunityCategory}
                                            onChange={e => setNewEvent({ ...newEvent, opportunityCategory: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                            placeholder="e.g., AI, Web Dev (comma sep)"
                                        />
                                    </div>
                                </div>

                                {/* Logistics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newEvent.date}
                                            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={newEvent.location}
                                            onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                            placeholder="e.g., Online / Delhi"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Mode</label>
                                        <select
                                            value={newEvent.mode}
                                            onChange={e => setNewEvent({ ...newEvent, mode: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                        >
                                            <option>Online</option>
                                            <option>Offline</option>
                                            <option>Hybrid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Participation</label>
                                        <select
                                            value={newEvent.participationType}
                                            onChange={e => setNewEvent({ ...newEvent, participationType: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                        >
                                            <option>Individual</option>
                                            <option>Team</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Eligibility</label>
                                        <select
                                            value={newEvent.eligibility}
                                            onChange={e => setNewEvent({ ...newEvent, eligibility: e.target.value })}
                                            className="w-full p-2 bg-muted border border-border rounded-md"
                                        >
                                            <option>Everyone</option>
                                            <option>College Students</option>
                                            <option>School Students</option>
                                            <option>Professionals</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        required
                                        value={newEvent.description}
                                        onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="w-full p-2 bg-muted border border-border rounded-md min-h-[100px]"
                                        placeholder="Event details..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL (Banner)</label>
                                    <input
                                        type="url"
                                        value={newEvent.image}
                                        onChange={e => setNewEvent({ ...newEvent, image: e.target.value })}
                                        className="w-full p-2 bg-muted border border-border rounded-md"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Registration Link (Google Form)</label>
                                    <input
                                        type="url"
                                        value={newEvent.registerLink}
                                        onChange={e => setNewEvent({ ...newEvent, registerLink: e.target.value })}
                                        className="w-full p-2 bg-muted border border-border rounded-md"
                                        placeholder="https://forms.google.com/..."
                                    />
                                </div>

                                {/* Sponsors Section */}
                                <div className="border-t border-border pt-4">
                                    <h3 className="font-semibold mb-2">Sponsors</h3>
                                    <div className="space-y-2 mb-2">
                                        {newEvent.sponsors.map((sponsor, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-muted/50 p-2 rounded">
                                                <div className="flex-1 text-sm">
                                                    <div className="font-bold">{sponsor.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{sponsor.url}</div>
                                                </div>
                                                {sponsor.logo && <img src={sponsor.logo} alt={sponsor.name} className="w-8 h-8 object-contain" />}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSponsors = [...newEvent.sponsors];
                                                        newSponsors.splice(idx, 1);
                                                        setNewEvent({ ...newEvent, sponsors: newSponsors });
                                                    }}
                                                    className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            id="sponsor-name"
                                            placeholder="Name"
                                            className="p-2 bg-muted border border-border rounded text-sm"
                                        />
                                        <input
                                            id="sponsor-url"
                                            placeholder="Website URL"
                                            className="p-2 bg-muted border border-border rounded text-sm"
                                        />
                                        <input
                                            id="sponsor-logo"
                                            placeholder="Logo URL"
                                            className="p-2 bg-muted border border-border rounded text-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nameInput = document.getElementById('sponsor-name') as HTMLInputElement;
                                            const urlInput = document.getElementById('sponsor-url') as HTMLInputElement;
                                            const logoInput = document.getElementById('sponsor-logo') as HTMLInputElement;

                                            if (nameInput.value) {
                                                setNewEvent({
                                                    ...newEvent,
                                                    sponsors: [...newEvent.sponsors, {
                                                        name: nameInput.value,
                                                        url: urlInput.value,
                                                        logo: logoInput.value
                                                    }]
                                                });
                                                nameInput.value = '';
                                                urlInput.value = '';
                                                logoInput.value = '';
                                            }
                                        }}
                                        className="mt-2 text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded hover:opacity-90"
                                    >
                                        + Add Sponsor
                                    </button>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={creatingEvent}
                                        className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {creatingEvent ? 'Creating...' : 'Create Event'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
