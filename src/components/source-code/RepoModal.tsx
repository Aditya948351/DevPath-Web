"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, ExternalLink, Code, FileText, Smartphone, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './RepoModal.module.css';

interface RepoData {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    icon: React.ReactNode;
    techStack: string[];
    features: string[];
    link: string;
    docsLink?: string;
    status: 'public' | 'private' | 'coming-soon';
}

interface RepoModalProps {
    isOpen: boolean;
    onClose: () => void;
    repo: RepoData | null;
}

export default function RepoModal({ isOpen, onClose, repo }: RepoModalProps) {
    if (!repo) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className={styles.modalContainer}>
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <button className={styles.closeButton} onClick={onClose}>
                                <X size={24} />
                            </button>

                            <div className={styles.header}>
                                <div className={styles.iconWrapper}>
                                    {repo.icon}
                                </div>
                                <div>
                                    <h2 className={styles.title}>{repo.title}</h2>
                                    <div className={styles.badges}>
                                        {repo.status === 'public' && (
                                            <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                                                Public
                                            </span>
                                        )}
                                        {repo.status === 'private' && (
                                            <span className="px-2 py-1 rounded-md bg-pink-500/10 text-pink-500 text-xs font-bold border border-pink-500/20">
                                                Private Alpha
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.body}>
                                <p className={styles.description}>{repo.longDescription}</p>

                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Key Features</h3>
                                    <div className={styles.featuresGrid}>
                                        {repo.features.map((feature, index) => (
                                            <div key={index} className={styles.featureItem}>
                                                <CheckCircle2 size={16} className="text-primary shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Tech Stack</h3>
                                    <div className={styles.techTags}>
                                        {repo.techStack.map((tech, index) => (
                                            <span key={index} className={styles.techTag}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.footer}>
                                <a href={repo.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                                    <Button variant="primary" className="w-full justify-center gap-2">
                                        <Github size={18} />
                                        View on GitHub
                                    </Button>
                                </a>
                                {repo.docsLink && (
                                    <a href={repo.docsLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button variant="secondary" className="w-full justify-center gap-2">
                                            <FileText size={18} />
                                            Documentation
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
