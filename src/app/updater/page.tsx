"use client";

import { useState } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './Updater.module.css';

const releases = [
    {
        version: "v2.4.1",
        date: "December 14, 2025",
        type: "Stable",
        notes: [
            "Added new Wiki documentation system",
            "Implemented Coming Soon badges for learning paths",
            "Performance improvements for dashboard rendering",
            "Fixed layout issues on mobile devices"
        ]
    },
    {
        version: "v2.4.0",
        date: "December 10, 2025",
        type: "Major",
        notes: [
            "Launched new Gamification engine",
            "Added Real-time activity feed",
            "Redesigned User Profile page",
            "Introduced Dark Mode support"
        ]
    },
    {
        version: "v2.3.5",
        date: "November 28, 2025",
        type: "Patch",
        notes: [
            "Hotfix for login authentication flow",
            "Updated dependency packages",
            "Minor UI tweaks to Navbar"
        ]
    }
];

export default function UpdaterPage() {
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckUpdate = () => {
        setIsChecking(true);
        setTimeout(() => setIsChecking(false), 2000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.statusCard}>
                    <div className={styles.version}>v2.4.1</div>
                    <div className={styles.channel}>Stable Channel</div>

                    <div className={styles.message}>
                        <CheckCircle size={20} color="#10b981" />
                        You&apos;re up to date!
                    </div>

                    <Button
                        variant="primary"
                        icon={<RefreshCw size={18} className={isChecking ? 'animate-spin' : ''} />}
                        onClick={handleCheckUpdate}
                    >
                        {isChecking ? 'Checking...' : 'Check for Updates'}
                    </Button>

                    <div className={styles.settings}>
                        <div className={styles.settingRow}>
                            <span className={styles.settingLabel}>Auto-update enabled</span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={autoUpdate}
                                    onChange={() => setAutoUpdate(!autoUpdate)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                        <div className={styles.settingRow}>
                            <span className={styles.settingLabel}>Notify me about new releases</span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={() => setNotifications(!notifications)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '32px' }}>Release History</h2>

                <div className={styles.timeline}>
                    {releases.map((release, index) => (
                        <div key={index} className={styles.release}>
                            <div className={styles.releaseDot} />
                            <div className={styles.releaseHeader}>
                                <div className={styles.releaseVersion}>{release.version}</div>
                                <div className={styles.releaseDate}>{release.date}</div>
                            </div>
                            <div className={styles.releaseNotes}>
                                <ul className={styles.noteList}>
                                    {release.notes.map((note, i) => (
                                        <li key={i} className={styles.noteItem}>{note}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
