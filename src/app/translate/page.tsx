"use client";

import { Globe, Languages, MessageSquare, CheckCircle, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './Translate.module.css';

const languages = [
    { code: "es", name: "Spanish", native: "Español", progress: 100, contributors: 12, flag: "🇪🇸" },
    { code: "fr", name: "French", native: "Français", progress: 85, contributors: 8, flag: "🇫🇷" },
    { code: "de", name: "German", native: "Deutsch", progress: 92, contributors: 15, flag: "🇩🇪" },
    { code: "ja", name: "Japanese", native: "日本語", progress: 45, contributors: 6, flag: "🇯🇵" },
    { code: "pt", name: "Portuguese", native: "Português", progress: 78, contributors: 9, flag: "🇧🇷" },
    { code: "zh", name: "Chinese", native: "中文", progress: 30, contributors: 4, flag: "🇨🇳" },
    { code: "ru", name: "Russian", native: "Русский", progress: 60, contributors: 7, flag: "🇷🇺" },
    { code: "hi", name: "Hindi", native: "हिन्दी", progress: 15, contributors: 3, flag: "🇮🇳" },
];

export default function TranslatePage() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.hero}>
                    <Globe size={80} className={styles.globeIcon} />
                    <h1 className={styles.title}>Help DevPath Speak Your Language</h1>
                    <p className={styles.subtitle}>
                        Join our translation community and make DevPath accessible to developers worldwide.
                    </p>
                    <Button variant="primary" icon={<Languages size={20} />}>
                        Start Translating
                    </Button>
                </div>

                <div className={styles.grid}>
                    {languages.map((lang) => (
                        <div key={lang.code} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.flag}>{lang.flag}</span>
                                <span className={`${styles.statusBadge} ${lang.progress === 100 ? styles.complete :
                                    lang.progress > 50 ? styles.progress : styles.start
                                    }`}>
                                    {lang.progress === 100 ? 'Complete' :
                                        lang.progress > 0 ? 'In Progress' : 'Not Started'}
                                </span>
                            </div>

                            <h3 className={styles.langName}>{lang.name}</h3>
                            <p className={styles.langNative}>{lang.native}</p>

                            <div className={styles.progressContainer}>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${lang.progress}%` }}
                                    />
                                </div>
                                <div className={styles.progressLabel}>
                                    <span>{lang.progress}% translated</span>
                                    <span>{lang.contributors} contributors</span>
                                </div>
                            </div>

                            <Button variant="secondary" className="w-full">Contribute</Button>
                        </div>
                    ))}
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>How to Contribute</h2>
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <Languages size={32} />
                            </div>
                            <h3 className={styles.stepTitle}>1. Choose Language</h3>
                            <p className={styles.stepDesc}>Select your native language from the list or request a new one.</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <MessageSquare size={32} />
                            </div>
                            <h3 className={styles.stepTitle}>2. Translate</h3>
                            <p className={styles.stepDesc}>Translate strings using our easy-to-use web interface.</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <CheckCircle size={32} />
                            </div>
                            <h3 className={styles.stepTitle}>3. Review</h3>
                            <p className={styles.stepDesc}>Vote on translations from others to ensure quality.</p>
                        </div>
                    </div>
                </div>

                <div className={styles.section} style={{ textAlign: 'center' }}>
                    <h2 className={styles.sectionTitle}>Request a Language</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Don&apos;t see your language? Request it and we&apos;ll set it up!
                    </p>
                    <div className={styles.requestForm}>
                        <input type="text" placeholder="Language Name (e.g. Italian)" className={styles.input} />
                        <Button variant="primary" icon={<Plus size={20} />}>Request Language</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
