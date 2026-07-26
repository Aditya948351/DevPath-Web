'use client';

import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/Button';
import InteractiveBackground from '../ui/InteractiveBackground';
import styles from './Hero.module.css';
import { useEffect, useState, useRef } from 'react';

const LatestEventsHighlight = dynamic(() => import('./LatestEventsHighlight'));

const HeaderScene = dynamic(() => import('@/components/3d/HeaderScene'), {
  ssr: false,
  loading: () => null,
});

function AnimatedCounter({
  target,
  suffix = '',
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;

      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      setCount(Math.floor(progress * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Defer Three.js / HeaderScene until the hero section enters the viewport.
  // This removes the ~1 MB Three.js chunk from the critical JS bundle.
  const [showHeaderScene, setShowHeaderScene] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowHeaderScene(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.hero} ref={heroRef}>
      <InteractiveBackground />
      {/* Background 3D Model */}
      <div className="absolute md:inset-0 bottom-0 left-0 right-0 top-[35%] md:top-0 h-[45vh] md:h-full z-0 opacity-30 md:opacity-80 pointer-events-none overflow-hidden">
        {showHeaderScene ? <HeaderScene /> : null}
      </div>

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
          Stop coding alone. Join <strong>500+ active developers</strong>{' '}
          building real-world projects, contributing to open source, and
          accelerating their careers together.
        </p>

        <div className="flex flex-wrap justify-center gap-8 my-8">
          <div className={`${styles.statsItem} flex flex-col items-center`}>
            <span className="text-3xl font-bold text-foreground">
              <AnimatedCounter target={500} suffix="+" />
            </span>
            <span className="text-sm text-muted-foreground">
              Active Developers
            </span>
          </div>
          <div className={`${styles.statsItem} flex flex-col items-center`}>
            <span className="text-3xl font-bold text-foreground">
              <AnimatedCounter target={50} suffix="+" />
            </span>
            <span className="text-sm text-muted-foreground">
              Open Source Projects
            </span>
          </div>
          <div className={`${styles.statsItem} flex flex-col items-center`}>
            <span className="text-3xl font-bold text-foreground">
              <AnimatedCounter target={24} suffix="/7" />
            </span>
            <span className="text-sm text-muted-foreground">Peer Support</span>
          </div>
        </div>

        <div
          className={`${styles.ctas} flex flex-col sm:flex-row items-center gap-4 sm:gap-2`}
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              aria-label="Sign Up"
              variant="primary"
              icon={<ArrowRight size={20} />}
              className="w-full sm:w-auto justify-center"
            >
              Sign Up
            </Button>
          </Link>
          <Link
            href="https://linkly.link/2WCTY"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              aria-label="Join Community"
              variant="primary"
              icon={<ArrowRight size={20} />}
              className="w-full sm:w-auto justify-center"
            >
              Join Community
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Content Grid */}
      <div className="w-full px-2 mt-12 grid grid-cols-1 gap-4 relative z-10">
        <LatestEventsHighlight className="w-full mt-0 mb-0" />
      </div>
    </section>
  );
}
