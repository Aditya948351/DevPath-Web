"use client";

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../ui/Button';
import ParticleSystem from '../ui/ParticleSystem';
import styles from './Hero.module.css';

import { MagneticText } from '../ui/magnetic-text';

export default function Hero() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className={styles.hero}>
            <ParticleSystem />
            <div className={styles.glow} />

            {/* Duplicate navbar removed */}

            <div className={styles.content}>
                <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="relative w-32 h-32 mb-4 animate-float">
                        <Image
                            src="/logo.png"
                            alt="DevPath Logo"
                            fill
                            className="object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] rounded-full"
                        />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <MagneticText
                            text="MASTER YOUR"
                            hoverText="ACCELERATE"
                            className="text-5xl md:text-7xl font-bold tracking-tighter text-center"
                        />
                        <MagneticText
                            text="DEV JOURNEY"
                            hoverText="EXCELLENCE"
                            className="text-5xl md:text-7xl font-bold tracking-tighter text-center"
                        />
                    </div>
                </div>
                <p className={styles.subtitle}>
                    Join 50,000+ developers accelerating their coding skills through structured paths,
                    real projects, and an active community.
                </p>

                <div className={styles.ctas}>
                    {/* TODO: Add Download CTA when mobile app launches */}
                    <Link href="/paths">
                        <Button variant="primary" icon={<ArrowRight size={20} />}>
                            Explore Paths
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
