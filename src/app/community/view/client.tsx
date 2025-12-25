"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MessageSquare, Send, Loader2, Share2, Heart, Handshake, Lightbulb, PartyPopper, Smile } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const REACTIONS = [
    { emoji: '👍', label: 'Support', icon: <div className="text-xl">👍</div> },
    { emoji: '❤️', label: 'Love', icon: <Heart className="text-red-500 fill-red-500" size={20} /> },
    { emoji: '🥺', label: 'Cute', icon: <div className="text-xl">🥺</div> },
    { emoji: '🤝', label: 'Handshake', icon: <Handshake className="text-amber-600" size={20} /> },
    { emoji: '💡', label: 'Insightful', icon: <Lightbulb className="text-yellow-500 fill-yellow-500" size={20} /> },
    { emoji: '🎉', label: 'Celebrate', icon: <PartyPopper className="text-purple-500" size={20} /> },
];

export default function DiscussionViewClient() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const discussionId = searchParams.get('id');

    const [discussion, setDiscussion] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newReply, setNewReply] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reactions, setReactions] = useState<Record<string, string[]>>({}); // { emoji: [userIds] }
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!discussionId) {
            router.push('/community');
            return;
        }

        const fetchDiscussion = async () => {
            try {
                const docRef = doc(db, 'discussions', discussionId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setDiscussion({ id: docSnap.id, ...data });
                    setReactions(data.reactions || {});
                } else {
                    router.push('/community');
                }
            } catch (error) {
                console.error("Error fetching discussion:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscussion();

        // Real-time listener for discussion updates (reactions)
        const unsubDiscussion = onSnapshot(doc(db, 'discussions', discussionId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setDiscussion({ id: doc.id, ...data });
                setReactions(data.reactions || {});
            }
        });

        // Real-time listener for replies
        const q = query(collection(db, 'discussions', discussionId, 'replies'), orderBy('createdAt', 'asc'));
        const unsubReplies = onSnapshot(q, (snapshot) => {
            setReplies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubDiscussion();
            unsubReplies();
        };
    }, [discussionId, router]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newReply.trim() || !discussionId) return;

        setSubmitting(true);
        try {
            // Add reply
            await addDoc(collection(db, 'discussions', discussionId, 'replies'), {
                authorId: user.uid,
                authorName: user.name || 'Anonymous',
                content: newReply,
                createdAt: serverTimestamp(),
                likes: []
            });

            // Update reply count on discussion
            await updateDoc(doc(db, 'discussions', discussionId), {
                replyCount: increment(1)
            });

            setNewReply('');
        } catch (error) {
            console.error("Error adding reply:", error);
            alert("Failed to post reply.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReaction = async (emoji: string) => {
        if (!user || !discussionId) {
            alert("Please login to react.");
            return;
        }

        const currentReactions = { ...reactions };
        const userIds = currentReactions[emoji] || [];

        // Toggle reaction
        if (userIds.includes(user.uid)) {
            currentReactions[emoji] = userIds.filter(id => id !== user.uid);
        } else {
            currentReactions[emoji] = [...userIds, user.uid];
        }

        // Optimistic update
        setReactions(currentReactions);
        setShowReactionPicker(false);

        try {
            await updateDoc(doc(db, 'discussions', discussionId), {
                reactions: currentReactions
            });
        } catch (error) {
            console.error("Error updating reaction:", error);
            // Revert on error (optional, but good practice)
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (!discussion) return null;

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <button
                    onClick={() => router.push('/community')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Community
                </button>

                {/* Discussion Header */}
                <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {discussion.tags?.map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl font-bold mb-4">{discussion.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                        <span className="font-medium text-foreground">{discussion.authorName}</span>
                        <span>•</span>
                        <span>{discussion.createdAt?.seconds ? new Date(discussion.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                            {discussion.content}
                        </ReactMarkdown>
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-sm"
                                >
                                    <Smile size={18} />
                                    <span>React</span>
                                </button>

                                {showReactionPicker && (
                                    <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-xl shadow-lg p-2 flex gap-2 animate-in fade-in zoom-in-95 z-10">
                                        {REACTIONS.map((reaction) => (
                                            <button
                                                key={reaction.emoji}
                                                onClick={() => handleReaction(reaction.emoji)}
                                                className="p-2 hover:bg-muted rounded-lg transition-colors text-xl"
                                                title={reaction.label}
                                            >
                                                {reaction.icon}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {Object.entries(reactions).map(([emoji, userIds]) => {
                                    if (userIds.length === 0) return null;
                                    const reaction = REACTIONS.find(r => r.emoji === emoji);
                                    return (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(emoji)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-colors ${user && userIds.includes(user.uid)
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-background border-border hover:bg-muted'
                                                }`}
                                            title={`${userIds.length} people reacted with ${reaction?.label || emoji}`}
                                        >
                                            <span>{reaction?.icon || emoji}</span>
                                            <span>{userIds.length}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={20} />
                                <span>{replies.length} replies</span>
                            </div>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 hover:text-foreground transition-colors"
                            >
                                {copied ? <span className="text-green-500 flex items-center gap-2">Copied!</span> : <><Share2 size={20} /> Share</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Replies Section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">Replies</h3>

                    {replies.map(reply => (
                        <div key={reply.id} className="bg-card/50 border border-border rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className="font-semibold">{reply.authorName}</span>
                                <span className="text-xs text-muted-foreground">
                                    {reply.createdAt?.seconds ? new Date(reply.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                            <div className="prose prose-invert max-w-none text-sm">
                                <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                                    {reply.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {/* Reply Input */}
                    {user ? (
                        <form onSubmit={handleReply} className="bg-card border border-border rounded-xl p-4 mt-8">
                            <h4 className="font-semibold mb-4">Leave a reply</h4>
                            <textarea
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y mb-4"
                                placeholder="Write your reply... (Markdown supported)"
                                required
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !newReply.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    Post Reply
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center p-8 bg-muted/20 rounded-xl border border-border/50 border-dashed">
                            <p className="text-muted-foreground">Please login to reply to this discussion.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
