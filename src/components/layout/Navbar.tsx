"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Github, LogIn, Menu, X, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useAuth } from '@/context/AuthContext';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import styles from './Navbar.module.css';
import { calculateStreak } from '@/lib/streakUtils';
import { useMemo } from 'react';
import { useScroll, useSpring } from 'framer-motion';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/pathway', label: 'Pathway' },
    { href: '/community', label: 'Community' },
    { href: '/resources', label: 'Resources' },
    { href: '/events', label: 'Events' },
    { href: '/opensource', label: 'Open Source' },
    { href: '/team', label: 'Team' },
];

export default function Navbar() {
    const { user, login, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    const { currentStreak } = useMemo(() => calculateStreak(user?.loginDates), [user?.loginDates]);
    const pathname = usePathname();

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    if (pathname === '/ap') return null;

    return (
        <>
            <div className={styles.navbarContainer}>
                <nav className={styles.navbar}>
                    <Link href="/" className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <Image src={logo} alt="DevPath Logo" width={32} height={32} className="rounded-full" />
                        </div>
                        <span className={styles.logoText}>DevPath</span>
                    </Link>

                    {/* Center Pill Navigation */}
                    <div className={styles.navPill}>
                        <div className={styles.navLinks}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`${styles.navLink} ${link.label === 'Courses' ? 'text-xs' : ''}`}
                                    style={{ fontSize: link.label === 'Courses' ? '0.75rem' : undefined }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Scroll Progress Line attached to Pill */}
                        <motion.div
                            className={styles.progressBar}
                            style={{ scaleX }}
                        />
                    </div>

                    <div className={styles.actions}>
                        {user && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20" title="Current Streak">
                                <Flame size={16} fill="currentColor" />
                                <span className="text-sm font-bold">{currentStreak}</span>
                            </div>
                        )}
                        <ThemeToggle />
                        <a
                            href="https://github.com/devpathindcommunity-india/DevPath-Web"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.iconButton}
                            aria-label="GitHub"
                        >
                            <Github size={20} />
                        </a>

                        <NotificationDropdown />

                        {user ? (
                            <Link href="/profile" className={styles.profileAvatar} title={user.name || 'Profile'}>
                                {user.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt={user.name || 'User'}
                                        width={36}
                                        height={36}
                                        className="rounded-full"
                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-sm">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <Link href="/login" className={styles.profileButton}>
                                <LogIn size={16} />
                                <span className="hidden sm:inline">Login</span>
                            </Link>
                        )}

                        {/* Hamburger Menu Button (Mobile Only) */}
                        <button
                            className={styles.hamburger}
                            onClick={toggleMobileMenu}
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className={styles.mobileBackdrop}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobileMenu}
                        />

                        {/* Drawer */}
                        <motion.div
                            className={styles.mobileMenu}
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                        >
                            <div className={styles.mobileHeader}>
                                <span className={styles.mobileTitle}>Menu</span>
                                <button
                                    className={styles.mobileClose}
                                    onClick={closeMobileMenu}
                                    aria-label="Close menu"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className={styles.mobileNav}>
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={styles.mobileLink}
                                        onClick={closeMobileMenu}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className={styles.mobileActions}>
                                <div className={styles.mobileActionRow}>
                                    <ThemeToggle />
                                    <span>Toggle Theme</span>
                                </div>

                                {user ? (
                                    <Link
                                        href="/profile"
                                        className={styles.mobileProfileButton}
                                        onClick={closeMobileMenu}
                                    >
                                        <span>{user.name}</span>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className={styles.mobileProfileButton}
                                        onClick={closeMobileMenu}
                                    >
                                        <LogIn size={20} />
                                        <span>Login</span>
                                    </Link>
                                )}
                                {user && (
                                    <button
                                        className={styles.mobileProfileButton}
                                        onClick={() => {
                                            logout();
                                            closeMobileMenu();
                                            window.location.href = '/';
                                        }}
                                        style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                    >
                                        <LogOut size={20} />
                                        <span>Logout</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
