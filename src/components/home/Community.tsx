import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Button from '../ui/Button';
import styles from './Community.module.css';

export default function Community() {
    return (
        <section className={styles.community}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h2 className={styles.title}>
                        Join Our Thriving<br />
                        Developer Community
                    </h2>
                    <p className={styles.description}>
                        Connect with developers worldwide, share knowledge, and stay updated with the latest tech trends.
                        Get help when you&apos;re stuck and celebrate your wins together.
                    </p>
                    <a
                        href="https://chat.whatsapp.com/D2PRfQy4HYgC4XURhY2X8C"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                    >
                        <Button variant="primary" icon={<MessageCircle size={20} />}>
                            Join DevPath Community
                        </Button>
                    </a>
                </div>

                <div className={styles.mockupWrapper}>
                    <div className={styles.chatCard}>
                        <div className={styles.chatHeader}>
                            <div className={styles.serverInfo}>
                                <div className={styles.serverIcon}>
                                    <Image src="/logo.png" alt="DevPath" width={40} height={40} />
                                </div>
                                <div>
                                    <span className={styles.serverName}>DevPath Official</span>
                                    <span className={styles.serverStatus}>325 online</span>
                                </div>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                8,000+ members
                            </div>
                        </div>

                        <div className={styles.chatBody}>
                            <div className={styles.message}>
                                <div className={styles.avatar} style={{ background: '#3b82f6' }} />
                                <div className={styles.messageContent}>
                                    <div className={styles.sender}>
                                        <span className={styles.username} style={{ color: '#60a5fa' }}>Sarah Chen</span>
                                        <span className={styles.time}>Today at 10:42 AM</span>
                                    </div>
                                    <p className={styles.text}>Just finished the Advanced React Patterns course! The compound components section was a game changer. 🚀</p>
                                </div>
                            </div>

                            <div className={styles.message}>
                                <div className={styles.avatar} style={{ background: '#10b981' }} />
                                <div className={styles.messageContent}>
                                    <div className={styles.sender}>
                                        <span className={styles.username} style={{ color: '#34d399' }}>Alex Rivera</span>
                                        <span className={styles.time}>Today at 10:45 AM</span>
                                    </div>
                                    <p className={styles.text}>Congrats Sarah! I&apos;m working on the Node.js path right now. Would love to see your final project.</p>
                                </div>
                            </div>

                            <div className={styles.message}>
                                <div className={styles.avatar} style={{ background: '#f59e0b' }} />
                                <div className={styles.messageContent}>
                                    <div className={styles.sender}>
                                        <span className={styles.username} style={{ color: '#fbbf24' }}>Mike Johnson</span>
                                        <span className={styles.time}>Today at 10:48 AM</span>
                                    </div>
                                    <p className={styles.text}>Anyone up for a code review? I just pushed some changes to the open source dashboard project.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
