"use client";

import { useState } from 'react';
import { Target, ExternalLink, Github, Edit3, Play, Maximize2, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Project {
    id: string;
    title: string;
    description: string;
    authorName: string;
    userId: string;
    websiteUrl?: string;
    videoUrl?: string;
    screenshots?: string[];
    skills?: string[];
    createdAt?: any;
    stars?: string[]; // Array of user IDs
    starCount?: number;
}

interface ProjectCardProps {
    project: Project;
    isOwner?: boolean;
    onEdit?: (project: Project) => void;
}

export default function ProjectCard({ project, isOwner, onEdit }: ProjectCardProps) {
    const { user } = useAuth();
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isStarring, setIsStarring] = useState(false);

    // Optimistic UI state
    const [stars, setStars] = useState<string[]>(project.stars || []);
    const [starCount, setStarCount] = useState<number>(project.starCount || (project.stars?.length || 0));

    const hasStarred = user ? stars.includes(user.uid) : false;

    const handleToggleStar = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            alert("Please login to star projects.");
            return;
        }
        if (isStarring) return;

        setIsStarring(true);
        const newHasStarred = !hasStarred;

        // Optimistic update
        if (newHasStarred) {
            setStars([...stars, user.uid]);
            setStarCount(prev => prev + 1);
        } else {
            setStars(stars.filter(id => id !== user.uid));
            setStarCount(prev => Math.max(0, prev - 1));
        }

        try {
            // Update the project in the ROOT collection (Source of Truth for Showcase)
            const projectRef = doc(db, 'projects', project.id);
            if (newHasStarred) {
                await updateDoc(projectRef, {
                    stars: arrayUnion(user.uid),
                    starCount: increment(1)
                });
            } else {
                await updateDoc(projectRef, {
                    stars: arrayRemove(user.uid),
                    starCount: increment(-1)
                });
            }
        } catch (error) {
            console.error("Error starring project:", error);
            // Revert optimistic update
            if (newHasStarred) {
                setStars(stars.filter(id => id !== user.uid));
                setStarCount(prev => Math.max(0, prev - 1));
            } else {
                setStars([...stars, user.uid]);
                setStarCount(prev => prev + 1);
            }
            alert("Failed to update star.");
        } finally {
            setIsStarring(false);
        }
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return '';

        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1];
            } else if (url.includes('youtube.com/embed/')) {
                return url; // Already embed link
            }
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }

        // Google Drive
        if (url.includes('drive.google.com')) {
            // Convert view/sharing links to preview links
            return url.replace('/view', '/preview').replace('/usp=sharing', '');
        }

        return url;
    };

    const embedUrl = getEmbedUrl(project.videoUrl || '');

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group/card">
            {/* Media Section */}
            <div className="aspect-video bg-muted relative group">
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={project.title}
                    />
                ) : project.screenshots?.[0] ? (
                    <img
                        src={project.screenshots[0]}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                        <Target size={48} className="opacity-20" />
                    </div>
                )}

                {/* Overlay Actions */}
                {isOwner && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(project);
                        }}
                        className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm text-foreground rounded-full shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors z-10"
                        title="Edit Project"
                    >
                        <Edit3 size={16} />
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-lg line-clamp-1 flex-1" title={project.title}>{project.title}</h3>
                    <div className="flex items-center gap-2">
                        {project.websiteUrl && (
                            <a
                                href={project.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ExternalLink size={18} />
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-primary font-medium">by {project.authorName || 'Anonymous'}</p>

                    {/* Star Button */}
                    <button
                        onClick={handleToggleStar}
                        disabled={isStarring}
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${hasStarred
                            ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                            }`}
                    >
                        <Star size={14} fill={hasStarred ? "currentColor" : "none"} />
                        {starCount}
                    </button>
                </div>

                {/* Tech Stack */}
                {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-secondary/50 text-secondary-foreground text-[10px] rounded-full border border-border/50">
                                {skill}
                            </span>
                        ))}
                        {project.skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-secondary/50 text-secondary-foreground text-[10px] rounded-full border border-border/50">
                                +{project.skills.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Description */}
                <div className={`text-sm text-muted-foreground prose prose-invert prose-sm max-w-none mb-4 ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                        {project.description}
                    </ReactMarkdown>
                </div>

                {project.description.length > 150 && (
                    <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-xs text-primary hover:underline mt-auto self-start"
                    >
                        {showFullDescription ? 'Show Less' : 'Read More'}
                    </button>
                )}
            </div>
        </div>
    );
}
