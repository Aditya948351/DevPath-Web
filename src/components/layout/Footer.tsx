import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Send, Book, Cloud, Flag, Users, RefreshCw, Code, Globe } from 'lucide-react';
import logo from '@/assets/logo.png';
import styles from './Footer.module.css';

import { MagneticText } from '../ui/magnetic-text';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.content}>
                    <div className={styles.brand}>
                        <h3>
                            <Image src={logo} alt="DevPath Logo" width={32} height={32} style={{ marginRight: '12px' }} />
                            DevPath
                        </h3>
                        <p className={styles.tagline}>
                            Empowering developers to master their craft through structured learning,
                            real-world projects, and a supportive community.
                        </p>
                    </div>

                    <div className={styles.column}>
                        <div className="mb-6">
                            <MagneticText
                                text="RESOURCES"
                                hoverText="EXPLORE"
                                className="text-xl font-bold"
                            />
                        </div>
                        <div className={styles.links}>
                            <Link href="/wiki" className={styles.link}>
                                <Book size={16} /> Wiki & Docs
                            </Link>
                            <Link href="/backups" className={styles.link}>
                                <Cloud size={16} /> Backups
                            </Link>
                            <Link href="/flags" className={styles.link}>
                                <Flag size={16} /> Feature Flags
                            </Link>
                            <Link href="/contributors" className={styles.link}>
                                <Users size={16} /> Contributors
                            </Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <div className="mb-6">
                            <MagneticText
                                text="LINKS"
                                hoverText="VISIT"
                                className="text-xl font-bold"
                            />
                        </div>
                        <div className={styles.links}>
                            <Link href="/updater" className={styles.link}>
                                <RefreshCw size={16} /> Updater
                            </Link>
                            {/* TODO: Add Download CTA when mobile app launches */}
                            <Link href="/source-code" className={styles.link}>
                                <Code size={16} /> Source Code
                            </Link>
                            <Link href="/translate" className={styles.link}>
                                <Globe size={16} /> Translate
                            </Link>
                        </div>

                        <div className="mt-8">
                            <h4 className="text-sm font-semibold text-gray-400 mb-4">Stay Updated</h4>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors w-full"
                                />
                                <button className="bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg p-2 transition-colors">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <div className={styles.copyright}>
                        <p>&copy; {new Date().getFullYear()} DevPath. All rights reserved.</p>
                    </div>
                    <div className={styles.socials}>
                        <a href="#" className={`${styles.socialIcon} hover:scale-110 hover:text-cyan-400 transition-all`} aria-label="GitHub">
                            <Github size={20} />
                        </a>
                        <a href="#" className={`${styles.socialIcon} hover:scale-110 hover:text-cyan-400 transition-all`} aria-label="Telegram">
                            <Send size={20} />
                        </a>
                        <a href="#" className={`${styles.socialIcon} hover:scale-110 hover:text-cyan-400 transition-all`} aria-label="Twitter">
                            <Twitter size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
