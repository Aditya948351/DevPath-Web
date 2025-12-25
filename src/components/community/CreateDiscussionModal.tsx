"use client";

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CreateDiscussionModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    onSuccess: () => void;
}

export default function CreateDiscussionModal({ isOpen, onClose, userId, userName, onSuccess }: CreateDiscussionModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

            await addDoc(collection(db, 'discussions'), {
                authorId: userId,
                authorName: userName,
                title,
                content,
                tags: tagsArray,
                likes: [],
                replyCount: 0,
                createdAt: serverTimestamp()
            });

            onSuccess();
            onClose();
            setTitle('');
            setContent('');
            setTags('');
        } catch (error) {
            console.error("Error creating discussion:", error);
            alert("Failed to create discussion. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold">Start a Discussion</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="What's on your mind?"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Content (Markdown supported)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                            placeholder="Share your thoughts, ask questions, or showcase your work..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="e.g., Help, Showcase, React, Firebase"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Post Discussion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
