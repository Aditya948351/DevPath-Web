"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

interface FollowButtonProps {
    targetUserId: string;
    targetRole?: string;
    targetEmail?: string;
    className?: string;
}

export default function FollowButton({ targetUserId, targetRole = 'member', targetEmail, className = '' }: FollowButtonProps) {
    const { user, followUser, unfollowUser } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user?.following?.includes(targetUserId)) {
            setIsFollowing(true);
        } else {
            setIsFollowing(false);
        }
    }, [user?.following, targetUserId]);

    const handleFollowToggle = async () => {
        if (!user) {
            alert("Please login to follow users.");
            return;
        }
        if (user.uid === targetUserId) return;

        setIsLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(targetUserId, targetRole, targetEmail);
                setIsFollowing(false);
            } else {
                console.log('FollowButton: Following user', { targetUserId, targetRole, targetEmail });
                await followUser(targetUserId, targetRole, targetEmail);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || user.uid === targetUserId) return null;

    return (
        <button
            onClick={handleFollowToggle}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isFollowing
                ? 'bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-500 border border-border'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                } ${className}`}
        >
            {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserCheck size={16} />
                    Following
                </>
            ) : (
                <>
                    <UserPlus size={16} />
                    Follow
                </>
            )}
        </button>
    );
}
