"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Newspaper, RefreshCw, AlertCircle } from 'lucide-react';
import styles from './CodingNews.module.css';

interface NewsItem {
    source: string;
    title: string;
    url: string;
    image: string | null;
}

export default function CodingNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Scroll Logic Refs
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const mouseXRef = useRef<number>(0);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_NEWS_API_URL;
            if (!apiUrl) {
                throw new Error("API URL not configured");
            }

            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }
            const data = await response.json();
            setNews(data);
        } catch (err) {
            console.error("Error fetching news:", err);
            setError("Failed to load latest news. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    // Mouse-driven scroll effect
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let animationFrameId: number;

        const scroll = () => {
            if (container) {
                if (isHovering) {
                    // Mouse movement scrolling logic
                    const rect = container.getBoundingClientRect();
                    const relativeX = mouseXRef.current - rect.left;
                    const width = rect.width;

                    // Define zones
                    const leftZone = width * 0.3;
                    const rightZone = width * 0.7;

                    if (relativeX < leftZone) {
                        // Scroll Left - speed increases as we get closer to edge
                        const speed = Math.max(1, (leftZone - relativeX) / 10); // Adjusted speed divisor
                        container.scrollLeft -= speed;
                    } else if (relativeX > rightZone) {
                        // Scroll Right - speed increases as we get closer to edge
                        const speed = Math.max(1, (relativeX - rightZone) / 10); // Adjusted speed divisor
                        container.scrollLeft += speed;
                    }
                } else {
                    // Auto-scroll when not hovering
                    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
                        container.scrollLeft = 0;
                    } else {
                        container.scrollLeft += 0.5; // Slow auto-scroll speed
                    }
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isHovering]);

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className="flex items-center gap-3">
                        <div className={styles.iconWrapper}>
                            <Newspaper size={24} />
                        </div>
                        <h2 className={styles.title}>Latest Tech News</h2>
                    </div>
                    <button
                        onClick={fetchNews}
                        className={styles.refreshButton}
                        disabled={loading}
                        aria-label="Refresh news"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                {error && (
                    <div className={styles.error}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className={styles.grid}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonImage} />
                                <div className={styles.skeletonContent}>
                                    <div className={styles.skeletonLine} style={{ width: '80%' }} />
                                    <div className={styles.skeletonLine} style={{ width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        className={styles.scrollContainer}
                        ref={scrollContainerRef}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        onMouseMove={(e) => {
                            mouseXRef.current = e.clientX;
                        }}
                    >
                        <div className={styles.scrollTrack}>
                            {news.map((item, index) => (
                                <motion.a
                                    key={`${index}-${item.url}`}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.card}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className={styles.imageWrapper}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className={styles.image} onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1000&auto=format&fit=crop';
                                            }} />
                                        ) : (
                                            <div className={styles.placeholderImage}>
                                                <Newspaper size={32} opacity={0.5} />
                                            </div>
                                        )}
                                        <div className={styles.sourceBadge}>{item.source}</div>
                                    </div>
                                    <div className={styles.content}>
                                        <h3 className={styles.cardTitle}>{item.title}</h3>
                                        <div className={styles.cardFooter}>
                                            <span className={styles.readMore}>
                                                Read Article <ExternalLink size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
