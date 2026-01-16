"use client";

import { useState, useEffect, useRef } from 'react';
import { Calendar, Video, MapPin, ExternalLink } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import styles from './Events.module.css';

export default function Events({ type = 'upcoming' }: { type?: 'upcoming' | 'past' }) {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const q = query(collection(db, 'events'), orderBy('date', 'asc'));
                const snapshot = await getDocs(q);
                const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

                const now = new Date();
                const filteredEvents = allEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    if (type === 'upcoming') {
                        return eventDate >= now;
                    } else {
                        return eventDate < now;
                    }
                });

                // For past events, we might want to show most recent first
                if (type === 'past') {
                    filteredEvents.reverse();
                }

                setEvents(filteredEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [type]);

    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: containerRef });

    return (
        <section className={styles.events}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    {type === 'upcoming' ? 'Upcoming Events' : 'Completed Events'}
                </h2>
                <p className={styles.subtitle}>
                    {type === 'upcoming'
                        ? 'Join live sessions, workshops, and challenges to level up your skills.'
                        : 'Check out our past events and see what we have accomplished.'}
                </p>
            </div>

            <div className={styles.scrollContainer} ref={containerRef}>
                <div className={styles.timeline}>
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground w-full">Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground w-full">
                            {type === 'upcoming'
                                ? 'No upcoming events scheduled.'
                                : 'No completed events found.'}
                        </div>
                    ) : (
                        events.map((event, index) => (
                            <EventCard key={event.id} event={event} index={index} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

function EventCard({ event, index }: { event: any, index: number }) {
    return (
        <motion.div
            className={styles.eventCard}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{
                scale: 1.05,
                rotateY: 5,
                zIndex: 10
            }}
            style={{ perspective: 1000 }}
        >
            <div className={styles.cardContent}>
                <div
                    className={styles.thumbnail}
                    style={{
                        backgroundImage: event.image ? `url(${event.image})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: event.image ? undefined : '#1a1f35'
                    }}
                />

                <div className={styles.details}>
                    <div className={styles.dateBadge}>
                        <Calendar size={14} />
                        {new Date(event.date).toLocaleDateString()}
                    </div>

                    <h3 className={styles.eventTitle}>{event.title}</h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {event.description}
                    </p>

                    <div className={styles.meta}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} /> {event.location || 'Online'}
                        </span>
                        {event.registerLink && (
                            <a
                                href={event.registerLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-bold hover:bg-primary/90 transition-colors ml-auto"
                            >
                                Register <ExternalLink size={12} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
