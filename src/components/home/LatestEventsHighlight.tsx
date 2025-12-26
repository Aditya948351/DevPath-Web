"use client";

import { useState, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';

export default function LatestEventsHighlight({ className }: { className?: string }) {
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchLatestEvent = async () => {
            try {
                // Query for events sorted by date ascending to get the nearest upcoming one
                const q = query(
                    collection(db, 'events'),
                    orderBy('date', 'asc'),
                    limit(1)
                );

                const snapshot = await getDocs(q);
                if (mounted && !snapshot.empty) {
                    const eventData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                    setEvent(eventData);
                }
            } catch (error) {
                console.error("Error fetching latest event:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchLatestEvent();
        return () => { mounted = false; };
    }, []);

    if (loading || !event) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full ${className || 'max-w-7xl mx-auto px-4 mt-12 mb-8'} h-full`}
        >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 shadow-2xl h-full">
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

                <div className="relative flex flex-col xl:flex-row gap-8 p-8 items-center h-full">
                    {/* Content */}
                    <div className="flex-1 space-y-6 z-10 w-full">
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-2">{event.title}</h3>
                            <p className="text-slate-400 text-lg line-clamp-2">{event.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-slate-300">
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>{event.location || 'Online'}</span>
                            </div>
                        </div>

                        <div className="flex flex-nowrap gap-4 pt-2">
                            {event.registerLink && (
                                <a
                                    href={event.registerLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 whitespace-nowrap flex-1"
                                >
                                    Register <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                            <Link
                                href="/events"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all border border-white/10 hover:border-white/20 whitespace-nowrap flex-1"
                            >
                                All Events <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Image/Visual - Hidden on smaller screens if needed or adjusted */}
                    {event.image && (
                        <div className="w-full xl:w-1/3 aspect-video xl:aspect-square max-h-[200px] xl:max-h-[250px] relative rounded-xl overflow-hidden shadow-2xl border border-white/10 group shrink-0 hidden sm:block">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: `url(${event.image})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
