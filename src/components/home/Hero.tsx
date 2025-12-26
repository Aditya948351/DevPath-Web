"use client";

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../ui/Button';
import InteractiveBackground from '../ui/InteractiveBackground';
import styles from './Hero.module.css';

import { MagneticText } from '../ui/magnetic-text';

import LatestEventsHighlight from './LatestEventsHighlight';
import InternshipCalendarCard from './InternshipCalendarCard';

export default function Hero() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className={styles.hero}>
            <InteractiveBackground />

            <div className={`${styles.content} relative z-10`}>
                <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="relative w-full max-w-[800px] mb-4">
                        <div className="flex flex-col items-center gap-2">
                            <h1 className={styles.title}>
                                The Ecosystem for <br />
                                <span className="text-primary">Ambitious Developers</span>
                            </h1>
                        </div>
                    </div>
                </div>
                <p className={styles.subtitle}>
                    Stop coding alone. Join <strong>500+ active developers</strong> building real-world projects,
                    contributing to open source, and accelerating their careers together.
                </p>

                <div className="flex flex-wrap justify-center gap-8 my-8">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-white">500+</span>
                        <span className="text-sm text-muted-foreground">Active Developers</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-white">50+</span>
                        <span className="text-sm text-muted-foreground">Open Source Projects</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-white">24/7</span>
                        <span className="text-sm text-muted-foreground">Peer Support</span>
                    </div>
                </div>

                <div className={styles.ctas}>
                    {/* TODO: Add Download CTA when mobile app launches */}
                    <Link href="https://linkly.link/2WCTY" target="_blank" rel="noopener noreferrer">
                        <Button variant="primary" icon={<ArrowRight size={20} />}>
                            Join Community
                        </Button>
                    </Link>
                </div>

            </div>



            {/* Featured Content Grid */}
            <div className="w-full px-2 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
                <LatestEventsHighlight className="w-full mt-0 mb-0" />
                <InternshipCalendarCard />
            </div>
        </section>
    );
}
