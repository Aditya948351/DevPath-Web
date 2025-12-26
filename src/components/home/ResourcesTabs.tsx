"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Video, Code, Terminal, Book, Star, Calendar, Brain, Briefcase, Users, Building2, MessageSquare, Map, GraduationCap, Layout } from 'lucide-react';
import { PremiumCard } from '../ui/PremiumCard';
import styles from './Resources.module.css';
import { placementResources } from '@/data/placementResources';
import { InternshipCalendarModal } from '../resources/InternshipCalendarModal';

// --- Original Data (Restored) ---
const originalResources = {
    internships: [
        {
            title: "Internship Calendar",
            description: "Track upcoming internship opportunities, application deadlines, and eligibility criteria for top tech companies.",
            icon: <Calendar size={28} />,
            color: "#8b5cf6",
            rating: 5.0,
            status: 'active'
        },
        {
            title: "Resume Review",
            description: "Get your resume reviewed by industry experts and seniors to increase your shortlist chances.",
            icon: <FileText size={28} />,
            color: "#ec4899",
            rating: 4.8,
            status: 'coming_soon'
        }
    ],
    learning: [
        {
            title: "Documentation Hub",
            description: "Comprehensive guides and API references for all supported technologies and frameworks.",
            icon: <FileText size={28} />,
            color: "#3b82f6",
            rating: 4.9,
            status: 'coming_soon'
        },
        {
            title: "Video Tutorials",
            description: "High-quality video courses covering everything from basics to advanced system design.",
            icon: <Video size={28} />,
            color: "#ef4444",
            rating: 4.8,
            status: 'coming_soon'
        },
        {
            title: "Cheat Sheets",
            description: "Quick reference cards for syntax, commands, and best practices across 20+ languages.",
            icon: <Terminal size={28} />,
            color: "#f59e0b",
            rating: 4.7,
            status: 'coming_soon'
        }
    ],
    practice: [
        {
            title: "Coding Challenges",
            description: "Practice your skills with daily algorithmic problems and real-world coding tasks.",
            icon: <Code size={28} />,
            color: "#10b981",
            rating: 4.9,
            status: 'coming_soon'
        },
        {
            title: "Interview Prep",
            description: "Mock interviews, system design questions, and behavioral guides to land your dream job.",
            icon: <Book size={28} />,
            color: "#8b5cf6",
            rating: 5.0,
            status: 'coming_soon'
        },
        {
            title: "Open Source",
            description: "Curated list of beginner-friendly open source projects to start contributing to today.",
            icon: <Star size={28} />,
            color: "#ec4899",
            rating: 4.8,
            status: 'coming_soon'
        }
    ],
    roadmaps: [
        {
            title: "Frontend Roadmap",
            description: "Step-by-step guide to becoming a modern Frontend Developer (HTML, CSS, React, Next.js).",
            icon: <Layout size={28} />,
            color: "#6366f1",
            rating: 4.9,
            status: 'coming_soon'
        },
        {
            title: "Backend Roadmap",
            description: "Master server-side programming, databases, and API design (Node.js, Python, Go).",
            icon: <Terminal size={28} />,
            color: "#10b981",
            rating: 4.9,
            status: 'coming_soon'
        },
        {
            title: "DevOps Roadmap",
            description: "Learn CI/CD, Docker, Kubernetes, and Cloud Infrastructure.",
            icon: <Briefcase size={28} />,
            color: "#f97316",
            rating: 4.8,
            status: 'coming_soon'
        }
    ]
};

// --- AI Prompts Config ---
const aiPromptsCategories = ['aptitude', 'technical', 'resume', 'hr', 'networking', 'companies'];
const categoryConfig: Record<string, { icon: any, color: string }> = {
    aptitude: { icon: <Brain size={28} />, color: "#8b5cf6" },
    technical: { icon: <Code size={28} />, color: "#3b82f6" },
    resume: { icon: <FileText size={28} />, color: "#ef4444" },
    hr: { icon: <Users size={28} />, color: "#f59e0b" },
    networking: { icon: <Briefcase size={28} />, color: "#10b981" },
    companies: { icon: <Building2 size={28} />, color: "#ec4899" },
};

export default function ResourcesTabs() {
    // 5 Main Sections
    const mainSections = [
        { id: 'ai-prompts', label: 'AI Prompts', icon: <Brain size={18} /> },
        { id: 'internships', label: 'Internships', icon: <Briefcase size={18} /> },
        { id: 'learning', label: 'Learning', icon: <GraduationCap size={18} /> },
        { id: 'practice', label: 'Practice', icon: <Code size={18} /> },
        { id: 'roadmaps', label: 'Roadmaps', icon: <Map size={18} /> },
    ];

    const [activeMainTab, setActiveMainTab] = useState('ai-prompts');
    const [activeSubTab, setActiveSubTab] = useState(aiPromptsCategories[0]);
    const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);

    const searchParams = useSearchParams();

    useEffect(() => {
        const openParam = searchParams.get('open');
        if (openParam === 'internship-calendar') {
            setActiveMainTab('internships');
            setIsInternshipModalOpen(true);
        }
    }, [searchParams]);

    const handleAccessNow = (title: string) => {
        if (title === "Internship Calendar") {
            setIsInternshipModalOpen(true);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <InternshipCalendarModal
                isOpen={isInternshipModalOpen}
                onClose={() => setIsInternshipModalOpen(false)}
            />

            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    Developer Resources
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Curated tools, prompts, and roadmaps to accelerate your career.
                </p>
            </div>

            {/* Main Navigation (Top Level) */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
                {mainSections.map((section) => {
                    const isActive = activeMainTab === section.id;
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveMainTab(section.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all border ${isActive
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                                : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {section.icon}
                            {section.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeMainTab === 'ai-prompts' ? (
                    // --- AI Prompts Section (With Sub-tabs) ---
                    <div>
                        {/* Sub Navigation */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-card/30 backdrop-blur-sm p-2 rounded-2xl border border-white/5 max-w-4xl mx-auto">
                            {aiPromptsCategories.map((catKey) => {
                                const catData = placementResources.placementPrep.categories[catKey as keyof typeof placementResources.placementPrep.categories];
                                const isActive = activeSubTab === catKey;

                                return (
                                    <button
                                        key={catKey}
                                        onClick={() => setActiveSubTab(catKey)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${isActive
                                            ? 'text-white shadow-md'
                                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeSubTabBg"
                                                className="absolute inset-0 bg-primary/80"
                                                initial={false}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10">{catData.title}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Prompts Grid */}
                        <div className={styles.grid}>
                            <AnimatePresence mode="wait">
                                {placementResources.placementPrep.categories[activeSubTab as keyof typeof placementResources.placementPrep.categories].prompts.map((prompt, index) => (
                                    <motion.div
                                        key={prompt.title}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="h-full"
                                    >
                                        <PremiumCard className={`${styles.resourceCard} h-full group flex flex-col`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div
                                                    className={styles.iconWrapper}
                                                    style={{ background: categoryConfig[activeSubTab]?.color || "#8b5cf6" }}
                                                >
                                                    {categoryConfig[activeSubTab]?.icon || <Star size={28} />}
                                                </div>
                                                <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground border border-white/10">
                                                    Prompt
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                                                {prompt.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm mb-6 flex-grow">
                                                {prompt.desc}
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-white/5">
                                                <div className="bg-black/40 rounded-lg p-3 text-xs text-slate-300 font-mono border border-white/5 relative group/code">
                                                    <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded">Copy</span>
                                                    </div>
                                                    {prompt.example}
                                                </div>
                                                <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/10 hover:border-white/20 flex items-center justify-center gap-2 group/btn">
                                                    Try this Prompt
                                                    <Terminal size={14} className="group-hover/btn:text-primary transition-colors" />
                                                </button>
                                            </div>
                                        </PremiumCard>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    // --- Other Sections (Standard Cards) ---
                    <div className={styles.grid}>
                        <AnimatePresence mode="popLayout">
                            {originalResources[activeMainTab as keyof typeof originalResources]?.map((resource, index) => (
                                <motion.div
                                    key={resource.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="h-full"
                                >
                                    <PremiumCard className={`${styles.resourceCard} h-full group relative overflow-hidden`}>
                                        {/* Coming Soon Overlay */}
                                        {resource.status === 'coming_soon' && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                                                <div className="bg-black/80 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-white/80 shadow-xl transform -rotate-12">
                                                    Not yet Added
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className={styles.iconWrapper}
                                            style={{ background: resource.color }}
                                        >
                                            {resource.icon}
                                        </div>

                                        <h3 className={styles.resourceTitle}>{resource.title}</h3>
                                        <p className={styles.resourceDesc}>{resource.description}</p>

                                        <div className={styles.footer}>
                                            <div className={styles.rating}>
                                                <Star size={16} fill="currentColor" />
                                                {resource.rating}
                                            </div>
                                            <button
                                                className={`${styles.action} ${resource.status === 'coming_soon' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => resource.status !== 'coming_soon' && handleAccessNow(resource.title)}
                                                disabled={resource.status === 'coming_soon'}
                                            >
                                                Access Now
                                            </button>
                                        </div>
                                    </PremiumCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
