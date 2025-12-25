
"use client";

import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Link as LinkIcon, Video, Image as ImageIcon, Globe, Save } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const POPULAR_SKILLS = [
    "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python", "Django", "Flask",
    "Java", "Spring Boot", "Kotlin", "Android", "Swift", "iOS", "Flutter", "React Native",
    "C++", "C#", ".NET", "Go", "Rust", "PHP", "Laravel", "Ruby", "Ruby on Rails",
    "HTML", "CSS", "Tailwind CSS", "Sass", "Bootstrap", "Material UI",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Firebase", "Supabase", "Redis",
    "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Git", "GitHub", "GitLab",
    "GraphQL", "REST API", "WebSockets", "Machine Learning", "AI", "Data Science"
];

interface ProjectUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userEmail?: string | null;
    userName: string;
    onSuccess: () => void;
    initialData?: any; // Project data for editing
}

export default function ProjectUploadModal({ isOpen, onClose, userId, userEmail, userName, onSuccess, initialData }: ProjectUploadModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [descTab, setDescTab] = useState<'write' | 'preview'>('write');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
    const [mediaType, setMediaType] = useState<'images' | 'video'>('images');
    const [screenshots, setScreenshots] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [screenshotInput, setScreenshotInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setWebsiteUrl(initialData.websiteUrl || '');
            setSkills(initialData.skills || []);
            setScreenshots(initialData.screenshots || []);
            setVideoUrl(initialData.videoUrl || '');
            setMediaType(initialData.videoUrl ? 'video' : 'images');
        } else {
            // Reset form for new upload
            setTitle('');
            setDescription('');
            setWebsiteUrl('');
            setSkills([]);
            setScreenshots([]);
            setVideoUrl('');
            setMediaType('images');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const filteredSkills = POPULAR_SKILLS.filter(skill =>
        skill.toLowerCase().includes(skillInput.toLowerCase()) &&
        !skills.includes(skill)
    ).slice(0, 5);

    const handleAddScreenshot = () => {
        if (screenshotInput && screenshots.length < 5) {
            setScreenshots([...screenshots, screenshotInput]);
            setScreenshotInput('');
        }
    };

    const handleRemoveScreenshot = (index: number) => {
        setScreenshots(screenshots.filter((_, i) => i !== index));
    };

    const handleAddSkill = (skillToAdd: string) => {
        if (!skills.includes(skillToAdd)) {
            setSkills([...skills, skillToAdd]);
        }
        setSkillInput('');
        setShowSkillSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            handleAddSkill(skillInput.trim());
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const projectData = {
                title,
                description,
                websiteUrl,
                skills,
                screenshots: mediaType === 'images' ? screenshots : [],
                videoUrl: mediaType === 'video' ? videoUrl : '',
                updatedAt: serverTimestamp()
            };

            if (initialData?.id) {
                // Update existing project
                const projectDataWithTimestamp = { ...projectData, updatedAt: serverTimestamp() };

                // 1. Update in Root Collection (Main Source)
                try {
                    await updateDoc(doc(db, 'projects', initialData.id), projectDataWithTimestamp);
                } catch (e) {
                    console.warn("Could not update root doc (might not exist):", e);
                }

                // 2. Update in Subcollection (Legacy/Backup)
                try {
                    const subcollectionParentId = userId;
                    await updateDoc(doc(db, 'members', subcollectionParentId, 'projects', initialData.id), projectDataWithTimestamp);
                } catch (e) {
                    console.warn("Could not update subcollection doc:", e);
                }
            } else {
                // Create new project
                const newProjectData = {
                    ...projectData,
                    userId,
                    authorName: userName,
                    likes: [],
                    createdAt: serverTimestamp(),
                    stars: [],
                    starCount: 0
                };

                // Generate ID
                const newDocRef = doc(collection(db, 'projects'));
                const newId = newDocRef.id;

                // 1. Set in Root Collection
                await setDoc(doc(db, 'projects', newId), newProjectData);

                // 2. Set in Subcollection (with same ID)
                const subcollectionParentId = userId;
                await setDoc(doc(db, 'members', subcollectionParentId, 'projects', newId), newProjectData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving project:", error);
            alert(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-xl font-bold">{initialData ? 'Edit Project' : 'Add New Project'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Project Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., E-commerce Dashboard"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium">Description</label>
                                <div className="flex bg-muted rounded-lg p-1">
                                    <button
                                        type="button"
                                        onClick={() => setDescTab('write')}
                                        className={`px-3 py-1 text-xs rounded-md transition-all ${descTab === 'write' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Write
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDescTab('preview')}
                                        className={`px-3 py-1 text-xs rounded-md transition-all ${descTab === 'preview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Preview
                                    </button>
                                </div>
                            </div>

                            {descTab === 'write' ? (
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px] font-mono text-sm"
                                    placeholder="Describe your project... (Markdown supported)"
                                    required
                                />
                            ) : (
                                <div className="w-full px-4 py-2 bg-background border border-border rounded-lg min-h-[150px] prose prose-invert max-w-none text-sm overflow-y-auto">
                                    {description ? (
                                        <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                                            {description}
                                        </ReactMarkdown>
                                    ) : (
                                        <span className="text-muted-foreground italic">Nothing to preview</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Website URL (Optional)</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="url"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="https://yourproject.com"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium mb-2">Skills / Tech Stack</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {skills.map(skill => (
                                    <span key={skill} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1">
                                        {skill}
                                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => {
                                    setSkillInput(e.target.value);
                                    setShowSkillSuggestions(true);
                                }}
                                onFocus={() => setShowSkillSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
                                onKeyDown={handleKeyDown}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Type skill and press Enter (e.g., React, Firebase)"
                            />

                            {showSkillSuggestions && skillInput && filteredSkills.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredSkills.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => handleAddSkill(skill)}
                                            className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Project Media</label>
                            <div className="flex gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setMediaType('images')}
                                    className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 transition-colors ${mediaType === 'images'
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-background border-border hover:bg-muted'
                                        }`}
                                >
                                    <ImageIcon size={18} /> Screenshots
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMediaType('video')}
                                    className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 transition-colors ${mediaType === 'video'
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-background border-border hover:bg-muted'
                                        }`}
                                >
                                    <Video size={18} /> Video Link
                                </button>
                            </div>

                            {mediaType === 'images' ? (
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-2">
                                        Add up to 5 screenshots (Paste URL)
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="url"
                                            value={screenshotInput}
                                            onChange={(e) => setScreenshotInput(e.target.value)}
                                            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="https://example.com/image.png"
                                            disabled={screenshots.length >= 5}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddScreenshot}
                                            disabled={!screenshotInput || screenshots.length >= 5}
                                            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    {screenshots.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {screenshots.map((url, index) => (
                                                <div key={index} className="relative group aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                                                    <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveScreenshot(index)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-2">
                                        Google Drive / YouTube Link
                                    </label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="url"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="https://drive.google.com/... or https://youtube.com/..."
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Supports YouTube and Google Drive preview links.</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {initialData ? 'Saving...' : 'Uploading...'}
                                    </>
                                ) : (
                                    <>
                                        {initialData ? <Save size={18} /> : <Upload size={18} />}
                                        {initialData ? 'Save Changes' : 'Upload Project'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
