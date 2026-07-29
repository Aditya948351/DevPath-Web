'use client';
const STATS_URL =
  process.env.NEXT_PUBLIC_GITHUB_STATS_URL ??
  'https://github-readme-stats-salesp07.vercel.app';
const STREAK_URL =
  process.env.NEXT_PUBLIC_GITHUB_STREAK_URL ??
  'https://github-readme-streak-stats-salesp07.vercel.app';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getEmbedUrl } from '@/lib/utils';
import { teamMembers } from '@/data/team';
import {
  Trophy,
  Flame,
  Star,
  Target,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Phone,
  Github,
  Instagram,
  Linkedin,
  CheckCircle,
  User as UserIcon,
  Heart,
  Share2,
  Video,
  Image as ImageIcon,
  Globe,
  Check,
  Users,
  Shield,
  X,
  GitMerge,
  BookOpen,
  Plus,
  Code2,
} from 'lucide-react';
import styles from '@/components/profile/Profile.module.css';
import Rewards from '@/components/profile/Rewards';
import FollowButton from '@/components/profile/FollowButton';
import LoginHeatmap from '@/components/profile/LoginHeatmap';
import DOMPurify from 'dompurify';
import { useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GIT_FALLBACK_STATS } from '@/lib/github';
import { getSafeSocialUrl } from '@/lib/safe-social-url';
import { copyToClipboard } from '@/lib/clipboard';
import { useNotificationActions } from '@/stores/ui-store';
import { useNotification } from '@/context/NotificationContext';
import NotFoundView from '@/components/layout/NotFoundView';

interface PublicUser {
  id?: string;
  name: string;
  photoURL?: string;
  bio?: string;
  role?: string;
  communityRoles?: string[];
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
  githubStats?: {
    connected: boolean;
    username?: string;
    repos?: number;
    totalStars?: number;
    followers?: number;
    following?: number;
    bio?: string;
    company?: string;
    location?: string;
    createdAt?: string;
    recentActivity?: any[];
    linesAdded?: number;
    linesRemoved?: number;
    linesContributed?: number;
    contributions?: number;
  };
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

function ProfileContent({ uid }: { uid?: string }) {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useNotificationActions();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotFound, setShowNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [copied, setCopied] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Helper to strip HTML for preview
  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      // Extract uid from URL if not provided via prop
      let currentUid = uid;
      if (!currentUid) {
        const parts = window.location.pathname.split('/');
        currentUid = parts[parts.length - 1];
      }

      if (!currentUid || currentUid === 'u') {
        setError('No user specified.');
        setShowNotFound(false);
        setLoading(false);
        return;
      }
      if (
        currentUid.length < 3 ||
        currentUid.length > 128 ||
        /[<>"']/.test(currentUid)
      ) {
        setError('Invalid user identifier.');
        setShowNotFound(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      setShowNotFound(false);

      try {
        let userData: PublicUser | undefined;
        let userId = currentUid;

        // 1. Try fetching by Document ID from 'members'
        let userDoc = await getDoc(doc(db, 'members', currentUid));

        // 2. If not found, try fetching by 'uid' field query in 'members'
        if (!userDoc.exists()) {
          const q = query(
            collection(db, 'members'),
            where('uid', '==', currentUid)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            userDoc = querySnapshot.docs[0];
            userId = userDoc.id;
          }
        }

        let isFromAdminCollection = false;

        // 3. If still not found, try 'admins' collection
        if (!userDoc.exists()) {
          userDoc = await getDoc(doc(db, 'admins', currentUid));
          if (userDoc.exists()) {
            isFromAdminCollection = true;
          } else {
            const q = query(
              collection(db, 'admins'),
              where('uid', '==', currentUid)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              userDoc = querySnapshot.docs[0];
              userId = userDoc.id;
              isFromAdminCollection = true;
            }
          }
        }

        if (userDoc.exists()) {
          userData = { id: userId, ...userDoc.data() } as PublicUser;

          if (isFromAdminCollection) {
            userData.role = 'admin';
          }

          // Privacy Check
          if (
            userData.privacySettings?.isPublic === false &&
            currentUser?.uid !== userId
          ) {
            setError('This profile is private.');
            setShowNotFound(true);
            setLoading(false);
            return;
          }

          // Check if user is an admin (if not already marked)
          if (userData.role !== 'admin') {
            // 1. Try by Email (if available)
            if (userData.email) {
              const adminCheck = await getDoc(
                doc(db, 'admins', userData.email)
              );
              if (adminCheck.exists()) {
                userData.role = 'admin';
              }
            }
            // 2. Try by UID field in admins collection (fallback)
            if (userData.role !== 'admin') {
              const q = query(
                collection(db, 'admins'),
                where('uid', '==', currentUid)
              );
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                userData.role = 'admin';
              }
            }
          }

          // Check Team Members for Community Role (Robust Matching)
          const normalize = (s: string | undefined) =>
            s?.toLowerCase().trim() || '';

          // 1. Try Strict Matching by Socials first (High Confidence)
          let teamMatches = teamMembers.filter(
            (m) =>
              (m.socials?.github &&
                userData?.github &&
                normalize(m.socials.github) === normalize(userData.github)) ||
              (m.socials?.linkedin &&
                userData?.linkedin &&
                normalize(m.socials.linkedin) === normalize(userData.linkedin))
          );

          const isHighConfidence = teamMatches.length > 0;

          // 2. Fallback to Name Matching ONLY if no social match found
          if (teamMatches.length === 0) {
            // For name-only matches, we filter out sensitive roles (Owner, Core Admin) to prevent impersonation
            teamMatches = teamMembers.filter(
              (m) =>
                normalize(m.name) === normalize(userData?.name) &&
                !['Owner', 'Core Admin'].includes(m.category)
            );
          }

          if (teamMatches.length > 0) {
            const roles = teamMatches.map((m) =>
              m.subRole ? `${m.role} - ${m.subRole}` : m.role
            );
            // Deduplicate
            const uniqueRoles = Array.from(new Set(roles));

            userData = {
              ...userData,
              communityRoles: uniqueRoles,
            };

            // Force Admin role ONLY if matched via Socials (High Confidence) AND category is Owner/Core Admin
            if (isHighConfidence) {
              if (
                teamMatches.some((m) =>
                  ['Owner', 'Core Admin'].includes(m.category)
                )
              ) {
                userData.role = 'admin';
              }
            }
          }

          // Fetch Role Details
          if ((userData as any).roleId) {
            const roleDoc = await getDoc(
              doc(db, 'roles', (userData as any).roleId)
            );
            if (roleDoc.exists()) {
              const roleData = roleDoc.data();
              userData = {
                ...userData,
                displayRole: roleData.title,
                roleTasks: roleData.tasks,
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
            const projectsData = projectsSnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                screenshots: data.screenshots || [],
                likes: data.likes || [],
                skills: data.skills || [],
              } as Project;
            });
            setProjects(projectsData);
          } catch (err: any) {
            // Fallback for missing index
            if (err.message.includes('index')) {
              const q = query(
                collection(db, 'projects'),
                where('userId', '==', userId)
              );
              const snapshot = await getDocs(q);
              const projectsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  screenshots: data.screenshots || [],
                  likes: data.likes || [],
                  skills: data.skills || [],
                } as Project;
              });
              projectsData.sort((a, b) => {
                const dateA = a.createdAt?.seconds
                  ? a.createdAt.seconds
                  : new Date(a.createdAt || 0).getTime() / 1000;
                const dateB = b.createdAt?.seconds
                  ? b.createdAt.seconds
                  : new Date(b.createdAt || 0).getTime() / 1000;
                return dateB - dateA;
              });
              setProjects(projectsData);
            }
          }
        } else {
          setError('User not found.');
          setShowNotFound(true);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load profile.');
        setShowNotFound(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProjects();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = `${window.location.origin}/u/${uid}`;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [uid]);

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/u/${uid}`;
    const copiedSuccessfully = await copyToClipboard(profileUrl);

    if (copiedSuccessfully) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      showSuccess('Profile link copied to clipboard.');
    } else {
      showError('Copying the profile link is not supported in this browser.');
    }
  };

  const handleLikeProject = async (
    projectId: string,
    currentLikes: string[]
  ) => {
    if (!currentUser) {
      alert('Please login to like projects.');
      return;
    }

    const isLiked = currentLikes.includes(currentUser.uid);
    // Update Root Collection
    const projectRef = doc(db, 'projects', projectId);

    try {
      if (isLiked) {
        await updateDoc(projectRef, {
          likes: arrayRemove(currentUser.uid),
        });
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, likes: p.likes.filter((id) => id !== currentUser.uid) }
              : p
          )
        );
      } else {
        await updateDoc(projectRef, {
          likes: arrayUnion(currentUser.uid),
        });
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, likes: [...p.likes, currentUser.uid] }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleShareProject = (projectId: string) => {
    const url = window.location.href;
    copyToClipboard(url).then((copiedSuccessfully) => {
    .catch(err => console.error(err))