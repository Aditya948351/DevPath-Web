import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/Button';
import ParticleSystem from '../ui/ParticleSystem';
import styles from './Hero.module.css';

import { MagneticText } from '../ui/magnetic-text';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <ParticleSystem />
            <div className={styles.glow} />

            <div className={styles.content}>
                <div className="flex flex-col items-center gap-4 mb-8">
                    <MagneticText
                        text="MASTER YOUR"
                        hoverText="ACCELERATE"
                        className="text-5xl md:text-7xl font-bold tracking-tighter"
                    />
                    <MagneticText
                        text="DEV JOURNEY"
                        hoverText="EXCELLENCE"
                        className="text-5xl md:text-7xl font-bold tracking-tighter"
                    />
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

            <div className={styles.mockupContainer}>
                <div className={styles.laptop}>
                    <div className={styles.screen}>
                        <div className={styles.screenContent}>
                            <div className={styles.sidebar} />
                            <div className={styles.main} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
