"use client";

import { Github, Code, FileText, MessageSquare, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './Contributors.module.css';

const contributors = [
    { name: "Aditya Patil", handle: "@Aditya948351", contributions: 500, types: ["code", "design", "community"], avatar: "AP" },
];

const topContributors = [
    { name: "Aditya Patil", handle: "@Aditya948351", contributions: 500, rank: 1, avatar: "AP" },
];

export default function ContributorsPage() {
    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Meet Our Amazing Contributors</h1>
                <p className={styles.subtitle}>
                    DevPath is built by developers, for developers. Thank you to everyone who makes this possible!
                </p>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>1,240</span>
                        <span className={styles.statLabel}>Total Contributors</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>15.4k</span>
                        <span className={styles.statLabel}>Contributions</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>128</span>
                        <span className={styles.statLabel}>Active This Month</span>
                    </div>
                </div>
            </div>

            <div className={styles.podium}>
                {topContributors.map((contributor) => (
                    <div key={contributor.handle} className={`${styles.podiumPlace} ${contributor.rank === 1 ? styles.first : ''}`}>
                        <div className={styles.avatarWrapper}>
                            {contributor.rank === 1 && <div className={styles.crown}>👑</div>}
                            {contributor.rank === 2 && <div className={styles.crown} style={{ fontSize: '24px', filter: 'grayscale(1)' }}>🥈</div>}
                            {contributor.rank === 3 && <div className={styles.crown} style={{ fontSize: '24px', filter: 'sepia(1)' }}>🥉</div>}
                            <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
                                {contributor.avatar}
                            </div>
                        </div>
                        <div className={styles.podiumName}>{contributor.name}</div>
                        <div className={styles.podiumContributions}>{contributor.contributions} commits</div>
                    </div>
                ))}
            </div>

            <div className={styles.grid}>
                {contributors.map((contributor, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                            {contributor.avatar}
                        </div>
                        <h3 className={styles.cardName}>{contributor.name}</h3>
                        <p className={styles.cardHandle}>{contributor.handle}</p>

                        <div className={styles.cardStats}>
                            <span>{contributor.contributions} contributions</span>
                        </div>

                        <div className={styles.types}>
                            {contributor.types.includes('code') && <div className={styles.typeIcon} title="Code"><Code size={16} /></div>}
                            {contributor.types.includes('docs') && <div className={styles.typeIcon} title="Documentation"><FileText size={16} /></div>}
                            {contributor.types.includes('design') && <div className={styles.typeIcon} title="Design"><MessageSquare size={16} /></div>}
                            {contributor.types.includes('community') && <div className={styles.typeIcon} title="Community"><Github size={16} /></div>}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.cta}>
                <h2 className={styles.ctaTitle}>Want to see your name here?</h2>
                <div className={styles.ctaButtons}>
                    <Button variant="primary" icon={<Github size={20} />}>
                        View Open Issues
                    </Button>
                    <Button variant="secondary" icon={<ExternalLink size={20} />}>
                        Read Contributing Guide
                    </Button>
                </div>
            </div>
        </div>
    );
}
