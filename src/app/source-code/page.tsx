"use client";

import { useState, ReactNode } from 'react';
import { Github, Star, GitFork, CircleDot, ExternalLink, Copy, Code, FileText, Smartphone } from 'lucide-react';
import Button from '@/components/ui/Button';
import InteractiveSteps from '@/components/source-code/InteractiveSteps';
import RepoModal from '@/components/source-code/RepoModal';
import styles from './SourceCode.module.css';

interface Repo {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    icon: ReactNode;
    techStack: string[];
    features: string[];
    link: string;
    status: 'public' | 'private' | 'coming-soon';
}

const repos: Repo[] = [
    {
        id: 'web',
        title: 'devpath-web',
        description: 'The main Next.js web application repository.',
        longDescription: 'The core of the DevPath platform. This repository houses the Next.js 14 application, including the interactive learning paths, community features, event management system, and user profiles. It features a modern, responsive UI built with Tailwind CSS and Framer Motion.',
        icon: <Code size={32} />,
        techStack: ['Next.js 14', 'TypeScript', 'Firebase', 'Tailwind CSS', 'Framer Motion', 'Zustand'],
        features: ['Authentication & User Profiles', 'Interactive Learning Roadmaps', 'Event Management System', 'Community Wiki & Docs', 'Real-time Notifications'],
        link: 'https://github.com/devpathindcommunity-india/DevPath-Web',
        status: 'public' as const
    },
    {
        id: 'docs',
        title: 'devpath-docs',
        description: 'Documentation, guides, and learning path curriculum content.',
        longDescription: 'The central knowledge base for DevPath. This repository contains all the markdown content for our wiki, learning paths, and contributor guidelines. It is designed to be easily editable by the community.',
        icon: <FileText size={32} />,
        techStack: ['Markdown', 'MDX', 'Contentlayer'],
        features: ['Comprehensive Wiki', 'Learning Path Curriculums', 'Contributor Guidelines', 'API Documentation'],
        link: 'https://github.com/devpathindcommunity-india/DevPath-Web', // Placeholder if no separate docs repo
        status: 'public' as const
    },
    {
        id: 'mobile',
        title: 'devpath-mobile',
        description: 'React Native mobile application for iOS and Android.',
        longDescription: 'Our upcoming mobile application built with React Native. It will allow users to access learning content offline, receive push notifications for events, and engage with the community on the go.',
        icon: <Smartphone size={32} />,
        techStack: ['React Native', 'Expo', 'NativeWind'],
        features: ['Offline Access', 'Push Notifications', 'Mobile-first UI', 'Cross-platform Support'],
        link: '#',
        status: 'private' as const
    }
];

export default function SourceCodePage() {
    const [selectedRepo, setSelectedRepo] = useState<typeof repos[0] | null>(null);

    return (
        <div className={styles.container}>
            <RepoModal
                isOpen={!!selectedRepo}
                onClose={() => setSelectedRepo(null)}
                repo={selectedRepo}
            />

            <div className={styles.content}>
                <div className={styles.hero}>
                    <Github size={80} className={styles.heroIcon} />
                    <h1 className={styles.title}>DevPath is Open Source</h1>
                    Built in public. Contribute, learn from the code, and help shape the future of developer education.

                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <Star size={16} color="#e3b341" fill="#e3b341" />
                            <span className={styles.statValue}>1</span>
                            <span className={styles.statLabel}>Star</span>
                        </div>
                        <div className={styles.statItem}>
                            <GitFork size={16} />
                            <span className={styles.statValue}>1</span>
                            <span className={styles.statLabel}>Fork</span>
                        </div>
                        <div className={styles.statItem}>
                            <CircleDot size={16} color="#10b981" />
                            <span className={styles.statValue}>5</span>
                            <span className={styles.statLabel}>Issues</span>
                        </div>
                    </div>
                </div>

                <div className={styles.repoGrid}>
                    {repos.map((repo) => (
                        <div key={repo.id} className={styles.repoCard} style={repo.status === 'private' ? { opacity: 0.7 } : {}}>
                            <div className={styles.repoHeader}>
                                <div className={styles.repoIcon}>
                                    {repo.icon}
                                </div>
                                {repo.status === 'coming-soon' || repo.status === 'private' ? (
                                    <span className={styles.badge} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                                        {repo.status === 'private' ? 'Private Alpha' : 'Coming Soon'}
                                    </span>
                                ) : (
                                    <ExternalLink size={20} className="text-gray-500" />
                                )}
                            </div>
                            <h3 className={styles.repoTitle}>{repo.title}</h3>
                            <p className={styles.repoDesc}>
                                {repo.description}
                            </p>
                            <div className={styles.repoMeta}>
                                <span className={styles.badge}>{repo.techStack[0]}</span>
                                {repo.status === 'public' && (
                                    <span className={styles.badge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>MIT License</span>
                                )}
                            </div>
                            <Button
                                variant={repo.status === 'public' ? 'primary' : 'ghost'}
                                className="w-full"
                                onClick={() => setSelectedRepo(repo)}
                                disabled={repo.status === 'private'}
                            >
                                {repo.status === 'private' ? 'Private Repo' : 'View Details'}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className={styles.quickStart}>
                    <h2 className={styles.sectionTitle}>How to Contribute</h2>
                    <InteractiveSteps />
                </div>

                <div className={styles.techStack}>
                    <h2 className={styles.sectionTitle}>Built With</h2>
                    <div className={styles.techGrid}>
                        <div className={styles.techItem}>Next.js 14</div>
                        <div className={styles.techItem}>React</div>
                        <div className={styles.techItem}>Firebase</div>
                        <div className={styles.techItem}>TypeScript</div>
                        <div className={styles.techItem}>Tailwind CSS</div>
                        <div className={styles.techItem}>Framer Motion</div>
                        <div className={styles.techItem}>Lucide Icons</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
