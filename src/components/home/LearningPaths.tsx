"use client";

import { useState } from 'react';
import { Clock, BookOpen, ArrowRight, Bell } from 'lucide-react';
import Button from '../ui/Button';
import ComingSoonBadge from '../features/ComingSoonBadge';
import styles from './LearningPaths.module.css';

interface Path {
    title: string;
    difficulty: string;
    duration: string;
    modules: number;
    color: string;
    highlights: string[];
    students: number;
    status: 'available' | 'coming-soon';
}

const paths: Path[] = [
    {
        title: "Full Stack React",
        difficulty: "Intermediate",
        duration: "12 weeks",
        modules: 24,
        color: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        highlights: ["Next.js App Router", "Server Actions", "PostgreSQL & Prisma"],
        students: 12500,
        status: 'coming-soon'
    },
    {
        title: "Python for AI",
        difficulty: "Advanced",
        duration: "16 weeks",
        modules: 32,
        color: "linear-gradient(135deg, #f59e0b, #b45309)",
        highlights: ["PyTorch Fundamentals", "Neural Networks", "LLM Integration"],
        students: 8400,
        status: 'coming-soon'
    },
    {
        title: "DevOps Mastery",
        difficulty: "Advanced",
        duration: "14 weeks",
        modules: 28,
        color: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
        highlights: ["Docker & Kubernetes", "CI/CD Pipelines", "AWS Infrastructure"],
        students: 6200,
        status: 'coming-soon'
    },
    {
        title: "Web3 Development",
        difficulty: "Beginner",
        duration: "10 weeks",
        modules: 20,
        color: "linear-gradient(135deg, #10b981, #047857)",
        highlights: ["Solidity Smart Contracts", "Ethers.js", "DApp Architecture"],
        students: 4500,
        status: 'coming-soon'
    }
];

export default function LearningPaths() {
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [selectedPath, setSelectedPath] = useState<string>("");
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handlePathClick = (path: Path) => {
        if (path.status === 'coming-soon') {
            setSelectedPath(path.title);
            setShowNotifyModal(true);
            setIsSubmitted(false);
            setEmail("");
        }
    };

    const handleNotifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 1000);
    };

    return (
        <section className={styles.learningPaths}>
            <div className={styles.header}>
                <h2 className={styles.title}>Structured Learning Paths</h2>
                <p className={styles.subtitle}>
                    Follow expert-curated curriculums designed to take you from zero to mastery.
                </p>
            </div>

            <div className={styles.carousel}>
                {paths.map((path, index) => (
                    <div
                        key={index}
                        className={`${styles.pathCard} ${path.status === 'coming-soon' ? styles.comingSoon : ''}`}
                        style={{ background: path.color }}
                        onClick={() => handlePathClick(path)}
                    >
                        {path.status === 'coming-soon' && <ComingSoonBadge />}

                        <div>
                            <span className={styles.badge}>{path.difficulty}</span>
                            <h3 className={styles.pathTitle}>{path.title}</h3>

                            <div className={styles.pathMeta}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={14} /> {path.duration}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <BookOpen size={14} /> {path.modules} modules
                                </span>
                            </div>

                            <div className={styles.highlights}>
                                {path.highlights.map((highlight, i) => (
                                    <div key={i} className={styles.highlight}>{highlight}</div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.students}>
                                <div className={styles.studentAvatar} />
                                <div className={styles.studentAvatar} style={{ marginLeft: '-10px' }} />
                                <div className={styles.studentAvatar} style={{ marginLeft: '-10px' }} />
                                <span className={styles.studentCount}>+{path.students.toLocaleString()} enrolled</span>
                            </div>

                            <Button
                                variant="ghost"
                                className="!p-2"
                                onClick={(e) => {
                                    if (path.status === 'coming-soon') {
                                        e.stopPropagation();
                                        handlePathClick(path);
                                    }
                                }}
                            >
                                {path.status === 'coming-soon' ? <Bell size={20} /> : <ArrowRight size={20} />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {showNotifyModal && (
                <div className={styles.modalOverlay} onClick={() => setShowNotifyModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={() => setShowNotifyModal(false)}>×</button>

                        {!isSubmitted ? (
                            <>
                                <h3 className={styles.modalTitle}>Coming Soon! 🚀</h3>
                                <p className={styles.modalText}>
                                    We&apos;re crafting an amazing curriculum for <strong>{selectedPath}</strong>.
                                    Want to be notified when it launches?
                                </p>
                                <form onSubmit={handleNotifySubmit} className={styles.notifyForm}>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className={styles.emailInput}
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                    <Button variant="primary" type="submit">Notify Me</Button>
                                </form>
                            </>
                        ) : (
                            <div className={styles.successMessage}>
                                <div className={styles.successIcon}>✨</div>
                                <h3>You&apos;re on the list!</h3>
                                <p>We&apos;ll email you when {selectedPath} is ready.</p>
                                <Button variant="secondary" onClick={() => setShowNotifyModal(false)}>Close</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
