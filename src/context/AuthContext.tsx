"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface User {
    uid: string;
    email: string | null;
    name: string | null;
    photoURL: string | null;
    role: 'admin' | 'member';
    mobile?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    bio?: string;
    state?: string;
    city?: string;
    district?: string;
    coverPhotoURL?: string;
    communityRole?: string;
    displayRole?: string;
    roleId?: string;
    roleTasks?: string[];
    aboutMarkdown?: string;
    privacySettings?: {
        showMobile: boolean;
        showLocation: boolean;
        showEmail: boolean;
        showProjects?: boolean;
        showRewards?: boolean;
        isPublic?: boolean;
        showInCommunity?: boolean;
    };
    points?: number;
    achievements?: string[]; // Array of achievement IDs
    claimedRewards?: string[]; // Array of claimed reward IDs
    githubStats?: {
        connected: boolean;
        username?: string;
        repos?: number;
        stars?: number;
        followers?: number;
        contributions?: number;
        lastFetched?: any;
    };
    followers?: string[]; // Array of user UIDs
    following?: string[]; // Array of user UIDs
    loginDates?: string[]; // Array of dates in YYYY-MM-DD format
    streak?: number;
    skills?: string[];
    badges?: string[];
    sessionId?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (data: Partial<User>) => Promise<void>;
    followUser: (targetUserId: string) => Promise<void>;
    unfollowUser: (targetUserId: string) => Promise<void>;
    followCommunity: () => Promise<void>;
    isLoading: boolean;
    isAdminVerified: boolean;
    verifyAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdminVerified, setIsAdminVerified] = useState(false);
    const unsubscribeSnapshot = useRef<(() => void) | null>(null);


    const SUPER_ADMIN_EMAIL = 'devpathind.community@gmail.com';

    useEffect(() => {
        // Ensure persistence is set to local
        setPersistence(auth, browserLocalPersistence).catch((error) => {
            console.error("Error setting persistence:", error);
        });

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // Cleanup previous listener if any
            if (unsubscribeSnapshot.current) {
                unsubscribeSnapshot.current();
                unsubscribeSnapshot.current = null;
            }

            if (firebaseUser) {
                try {
                    // SUPER ADMIN BYPASS
                    if (firebaseUser.email === SUPER_ADMIN_EMAIL) {
                        const superAdminUser: User = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: "Super Admin",
                            photoURL: firebaseUser.photoURL,
                            role: 'admin',
                            // Minimal required fields to prevent crashes
                            privacySettings: {
                                showMobile: false,
                                showLocation: false,
                                showEmail: false,
                                showProjects: false,
                                showRewards: false,
                                isPublic: false,
                                showInCommunity: false
                            }
                        };
                        setUser(superAdminUser);
                        setIsLoading(false);
                        return;
                    }

                    let role: 'admin' | 'member' = 'member';
                    let userData: any = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        showMobile: false,
                        showLocation: true,
                        showEmail: false,
                        showProjects: true,
                        showRewards: true,
                        isPublic: true,
                        showInCommunity: true
                    };

                    // Check if user is admin (only if email exists)
                    if (firebaseUser.email) {
                        const adminDocRef = doc(db, 'admins', firebaseUser.email.toLowerCase());
                        const adminDoc = await getDoc(adminDocRef);
                        if (adminDoc.exists()) {
                            role = 'admin';
                            userData = { ...userData, ...adminDoc.data() };
                        }
                    }

                    // If not admin, check member
                    if (role === 'member') {
                        // Check for member by UID (New Standard)
                        const memberDocRef = doc(db, 'members', firebaseUser.uid);
                        const memberDoc = await getDoc(memberDocRef);

                        if (memberDoc.exists()) {
                            // Valid member - Load data
                            userData = { ...userData, ...memberDoc.data() };
                        } else {
                            // New Member - Initialize Full Profile
                            const defaultUserData = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                name: firebaseUser.displayName || '',
                                photoURL: firebaseUser.photoURL || '',
                                role: 'member',
                                points: 0,
                                streak: 0,
                                level: 0,
                                badges: [],
                                achievements: [],
                                claimedRewards: [],
                                followers: [],
                                following: [],
                                loginDates: [],
                                privacySettings: {
                                    showMobile: false,
                                    showLocation: true,
                                    showEmail: false,
                                    showProjects: true,
                                    showRewards: true,
                                    isPublic: true,
                                    showInCommunity: true
                                },
                                githubStats: {
                                    connected: false,
                                    repos: 0,
                                    stars: 0,
                                    followers: 0,
                                    contributions: 0
                                },
                                bio: '',
                                city: '',
                                state: '',
                                district: '',
                                socialLinks: {}
                            };

                            // Create the new member document
                            await setDoc(memberDocRef, defaultUserData);
                            userData = { ...userData, ...defaultUserData };
                        }
                    }

                    // Setup Real-time Listener
                    const collectionName = role === 'admin' ? 'admins' : 'members';
                    // Use email for admins, UID for members
                    const docId = role === 'admin' ? firebaseUser.email!.toLowerCase() : firebaseUser.uid;

                    const { onSnapshot } = await import('firebase/firestore');

                    unsubscribeSnapshot.current = onSnapshot(doc(db, collectionName, docId), (docSnapshot) => {
                        if (docSnapshot.exists()) {
                            const data = docSnapshot.data();
                            const updatedUser = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                name: firebaseUser.displayName,
                                photoURL: firebaseUser.photoURL,
                                role: role,
                                ...data
                            };

                            // Single Session Enforcement
                            const localSessionId = localStorage.getItem('devpath_session_id');
                            if (data.sessionId && localSessionId && data.sessionId !== localSessionId) {
                                console.warn("Session mismatch. Logging out.");
                                signOut(auth);
                                localStorage.removeItem('devpath_session_id');
                                setUser(null);
                                setIsLoading(false);
                                return;
                            }

                            setUser(updatedUser as User);
                        }
                        setIsLoading(false);
                    });

                    // Track Login Date & Streak Logic (Run once per session, update Firestore only)
                    const { calculateStreak, getISTDateString } = await import('@/lib/streakUtils');
                    const today = getISTDateString(new Date());
                    let loginDates = userData.loginDates || [];
                    let shouldUpdate = false;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const updateData: Record<string, any> = {};
                    let pointsDelta = 0;

                    // 1. Check if new day login
                    if (!loginDates.includes(today)) {
                        loginDates.push(today);
                        updateData.loginDates = loginDates;
                        shouldUpdate = true;
                    }

                    // 2. Calculate Streak & Ensure Consistency
                    const { POINTS } = await import('@/lib/points');
                    const { currentStreak } = calculateStreak(loginDates);

                    if (shouldUpdate || userData.streak !== currentStreak) {
                        // Award 1 XP if streak increased (Daily Login)
                        if (currentStreak > (userData.streak || 0)) {
                            pointsDelta += POINTS.DAILY_LOGIN;

                            // Add Streak Bonus (1 point per day of streak)
                            pointsDelta += (currentStreak * POINTS.STREAK_BONUS_PER_DAY);

                            // 7-Day Streak Bonus
                            if (currentStreak % 7 === 0 && currentStreak > 0) {
                                pointsDelta += POINTS.WEEKLY_STREAK_BONUS;
                            }
                        }

                        updateData.streak = currentStreak;
                        shouldUpdate = true;
                    }

                    // 3. Update Firestore if needed (This will trigger the listener above)
                    if (shouldUpdate) {
                        const { increment } = await import('firebase/firestore');

                        const firestoreUpdate: any = { ...updateData };
                        if (pointsDelta > 0) {
                            firestoreUpdate.points = increment(pointsDelta);
                        }

                        // Sync to Leaderboard (XP)
                        if (pointsDelta > 0 || updateData.points !== undefined) {
                            const leaderboardRef = doc(db, 'leaderboard', firebaseUser.uid);
                            setDoc(leaderboardRef, {
                                uid: firebaseUser.uid,
                                name: userData.name,
                                photoURL: userData.photoURL,
                                points: increment(pointsDelta),
                                role: role,
                                lastActive: today
                            }, { merge: true }).catch(err => console.error("Error updating leaderboard:", err));
                        }

                        setDoc(doc(db, collectionName, docId), firestoreUpdate, { merge: true }).catch(err => console.error("Error updating user data:", err));
                    }

                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // No fallback - rely on DB
                    setUser(null);
                    setIsLoading(false);
                }
                setIsLoading(false);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => {
            unsubscribe();
            if (unsubscribeSnapshot.current) {
                unsubscribeSnapshot.current();
            }
        };
    }, []);



    const verifyAdmin = () => {
        setIsAdminVerified(true);
    };

    const login = async (email: string, pass: string) => {
        // Generate Session ID
        const sessionId = crypto.randomUUID();
        localStorage.setItem('devpath_session_id', sessionId);

        const userCredential = await signInWithEmailAndPassword(auth, email, pass);

        // Update Firestore with Session ID
        if (userCredential.user) {
            // We need to know if it's an admin or member to update the right collection
            // But at this point we might not know the role for sure without fetching.
            // However, we can try updating both or checking.
            // Actually, onAuthStateChanged will fire and fetch the user.
            // But we need to set the sessionId BEFORE the listener potentially logs us out?
            // No, the listener checks data.sessionId. If it's empty in DB, it might be fine?
            // But we want to enforce it.

            // Let's fetch the doc to know where to write.
            const { doc, getDoc, setDoc } = await import('firebase/firestore');

            // Check Admin
            const adminRef = doc(db, 'admins', email.toLowerCase());
            const adminSnap = await getDoc(adminRef);

            if (adminSnap.exists()) {
                await setDoc(adminRef, { sessionId }, { merge: true });
            } else {
                // Check Member
                const memberRef = doc(db, 'members', userCredential.user.uid);
                await setDoc(memberRef, { sessionId }, { merge: true });
            }
        }
    };

    const logout = async () => {
        localStorage.removeItem('devpath_session_id');
        setIsAdminVerified(false);
        await signOut(auth);
    };

    const updateUserProfile = async (data: Partial<User>) => {
        if (!user || !auth.currentUser) return;
        if (user.email === 'devpathind.community@gmail.com') return; // Super Admin Guard

        try {
            // 1. Update Firestore
            const collectionName = user.role === 'admin' ? 'admins' : 'members';
            // Use email for admins, UID for members
            const docId = user.role === 'admin' ? user.email!.toLowerCase() : user.uid;

            // Remove undefined fields
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== undefined)
            );

            await setDoc(doc(db, collectionName, docId), cleanData, { merge: true });

            // Sync to Leaderboard if points are updated
            if (data.points !== undefined) {
                const leaderboardRef = doc(db, 'leaderboard', user.uid);
                setDoc(leaderboardRef, {
                    points: data.points,
                    name: data.name || user.name, // Update name/photo if changed too
                    photoURL: data.photoURL || user.photoURL,
                    lastActive: new Date().toISOString().split('T')[0]
                }, { merge: true }).catch(err => console.error("Error syncing leaderboard:", err));
            }

            // 2. Update Auth Profile (if name or photoURL changed)
            if (data.name || data.photoURL) {
                // Dynamic import to avoid SSR issues if any, though updateProfile is standard
                const { updateProfile } = await import('firebase/auth');
                await updateProfile(auth.currentUser, {
                    displayName: data.name || auth.currentUser.displayName,
                    photoURL: data.photoURL || auth.currentUser.photoURL
                });
            }

            // 3. Update Local State
            setUser(prev => prev ? { ...prev, ...data } : null);

        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    const followUser = async (targetUserId: string) => {
        if (!user) return;
        if (user.email === 'devpathind.community@gmail.com') return; // Super Admin Guard
        if (user.uid === targetUserId) return; // Prevent self-follow
        if (user.following?.includes(targetUserId)) return; // Prevent double follow

        try {
            const batch = (await import('firebase/firestore')).writeBatch(db);
            const arrayUnion = (await import('firebase/firestore')).arrayUnion;
            const increment = (await import('firebase/firestore')).increment;
            const { POINTS } = await import('@/lib/points');

            // Update current user's following list
            const collectionName = user.role === 'admin' ? 'admins' : 'members';
            const docId = user.role === 'admin' ? user.email!.toLowerCase() : user.uid;
            const currentUserRef = doc(db, collectionName, docId);
            batch.update(currentUserRef, {
                following: arrayUnion(targetUserId)
            });

            // Update target user's followers list & Award Points
            const targetUserRef = doc(db, 'members', targetUserId);
            // Store UID in followers list for consistency
            batch.update(targetUserRef, {
                followers: arrayUnion(user.uid),
                points: increment(POINTS.FOLLOWER_GAINED) // Award 10 points
            });

            // Sync target user points to leaderboard
            const targetLeaderboardRef = doc(db, 'leaderboard', targetUserId);
            batch.set(targetLeaderboardRef, {
                points: increment(POINTS.FOLLOWER_GAINED)
            }, { merge: true });

            await batch.commit();

            // Update local state
            setUser(prev => prev ? { ...prev, following: [...(prev.following || []), targetUserId] } : null);
        } catch (error) {
            console.error("Error following user:", error);
            throw error;
        }
    };

    const unfollowUser = async (targetUserId: string) => {
        if (!user) return;
        if (user.email === 'devpathind.community@gmail.com') return; // Super Admin Guard
        try {
            const batch = (await import('firebase/firestore')).writeBatch(db);
            const arrayRemove = (await import('firebase/firestore')).arrayRemove;
            const increment = (await import('firebase/firestore')).increment;


            // Update current user's following list
            const collectionName = user.role === 'admin' ? 'admins' : 'members';
            const docId = user.role === 'admin' ? user.email!.toLowerCase() : user.uid;
            const currentUserRef = doc(db, collectionName, docId);
            batch.update(currentUserRef, {
                following: arrayRemove(targetUserId)
            });

            // Update target user's followers list
            const targetUserRef = doc(db, 'members', targetUserId);
            batch.update(targetUserRef, {
                followers: arrayRemove(user.uid) // Remove UID
                // We do not deduct points on unfollow to prevent negative balances
            });

            await batch.commit();

            // Update local state
            setUser(prev => prev ? { ...prev, following: (prev.following || []).filter(id => id !== targetUserId) } : null);
        } catch (error) {
            console.error("Error unfollowing user:", error);
            throw error;
        }
    };

    const followCommunity = async () => {
        if (!user) return;
        if (user.email === 'devpathind.community@gmail.com') return; // Super Admin Guard
        // Check if already followed (using a flag or badge)
        if (user.achievements?.includes('community_follower')) return;

        try {
            const { POINTS } = await import('@/lib/points');
            const arrayUnion = (await import('firebase/firestore')).arrayUnion;
            const increment = (await import('firebase/firestore')).increment;

            const collectionName = user.role === 'admin' ? 'admins' : 'members';
            const docId = user.role === 'admin' ? user.email!.toLowerCase() : user.uid;
            const userRef = doc(db, collectionName, docId);

            await setDoc(userRef, {
                achievements: arrayUnion('community_follower'),
                points: increment(POINTS.FOLLOW_COMMUNITY)
            }, { merge: true });

            // Sync to Leaderboard
            const leaderboardRef = doc(db, 'leaderboard', user.uid);
            await setDoc(leaderboardRef, {
                points: increment(POINTS.FOLLOW_COMMUNITY)
            }, { merge: true });

            setUser(prev => prev ? {
                ...prev,
                achievements: [...(prev.achievements || []), 'community_follower'],
                points: (prev.points || 0) + POINTS.FOLLOW_COMMUNITY
            } : null);

        } catch (error) {
            console.error("Error following community:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUserProfile, followUser, unfollowUser, followCommunity, isLoading, isAdminVerified, verifyAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
