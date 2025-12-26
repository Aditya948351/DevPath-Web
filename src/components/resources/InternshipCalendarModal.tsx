"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, ExternalLink, Clock, DollarSign, GraduationCap, Star } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface InternshipCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InternshipCalendarModal({ isOpen, onClose }: InternshipCalendarModalProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'summer' | 'winter'>('summer');
    const [internshipData, setInternshipData] = useState<any>(null);
    const [starCount, setStarCount] = useState(0);
    const [hasStarred, setHasStarred] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchInternshipData();
        }
    }, [isOpen]);

    const fetchInternshipData = async () => {
        try {
            const docRef = doc(db, 'resources', 'Internship_Calendar_2026');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setInternshipData(data);
                setStarCount(data.starCount || 0);

                // Check if user has starred this resource
                if (user) {
                    const userRef = doc(db, 'members', user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const starredResources = userSnap.data().starredResources || [];
                        setHasStarred(starredResources.includes('Internship_Calendar_2026'));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching internship data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStar = async () => {
        if (!user) {
            alert('Please login to star resources!');
            return;
        }

        try {
            const resourceRef = doc(db, 'resources', 'Internship_Calendar_2026');
            const userRef = doc(db, 'members', user.uid);

            if (hasStarred) {
                // Unstar
                await updateDoc(resourceRef, {
                    starCount: increment(-1)
                });
                await updateDoc(userRef, {
                    starredResources: (await getDoc(userRef)).data()?.starredResources?.filter((id: string) => id !== 'Internship_Calendar_2026') || []
                });
                setStarCount(prev => prev - 1);
                setHasStarred(false);
            } else {
                // Star
                await updateDoc(resourceRef, {
                    starCount: increment(1)
                });
                const userSnap = await getDoc(userRef);
                const currentStarred = userSnap.data()?.starredResources || [];
                await updateDoc(userRef, {
                    starredResources: [...currentStarred, 'Internship_Calendar_2026']
                });
                setStarCount(prev => prev + 1);
                setHasStarred(true);
            }
        } catch (error) {
            console.error('Error starring resource:', error);
            alert('Failed to star resource. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            <Calendar className="text-primary" />
                                            2026 Internship Calendar
                                        </h2>
                                        <button
                                            onClick={handleStar}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${hasStarred
                                                    ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                                    : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <Star size={16} fill={hasStarred ? 'currentColor' : 'none'} />
                                            {starCount}
                                        </button>
                                    </div>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        Curated list of top internship opportunities for 2026 batch.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 px-6 pt-4 border-b border-white/10">
                                <button
                                    onClick={() => setActiveTab('summer')}
                                    className={`px-4 py-2 rounded-t-lg font-medium transition-all ${activeTab === 'summer'
                                            ? 'bg-primary text-white'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    Summer Internships (May–July 2026)
                                </button>
                                <button
                                    onClick={() => setActiveTab('winter')}
                                    className={`px-4 py-2 rounded-t-lg font-medium transition-all ${activeTab === 'winter'
                                            ? 'bg-primary text-white'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    Winter Internships (Jan–April 2026)
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {loading ? (
                                    <div className="text-center text-white/60 py-8">Loading internships...</div>
                                ) : internshipData ? (
                                    internshipData[activeTab]?.map((internship: any, index: number) => (
                                        <motion.div
                                            key={internship.company}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Company Logo */}
                                                <div
                                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                                                    style={{ backgroundColor: internship.color }}
                                                >
                                                    {internship.company.charAt(0)}
                                                </div>

                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">{internship.company}</h3>
                                                        <p className="text-xs text-muted-foreground">{internship.role}</p>
                                                    </div>

                                                    {/* Details Grid */}
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="flex items-center gap-2 text-white/70">
                                                            <Calendar size={14} className="text-primary" />
                                                            <span>Apply: {internship.dates}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-white/70">
                                                            <Clock size={14} className="text-primary" />
                                                            <span>{internship.duration}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-white/70">
                                                            <DollarSign size={14} className="text-primary" />
                                                            <span>{internship.stipend}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-white/70">
                                                            <GraduationCap size={14} className="text-primary" />
                                                            <span className="text-xs">{internship.eligibility}</span>
                                                        </div>
                                                    </div>

                                                    {/* Links */}
                                                    <div className={`grid gap-3 ${internship.links.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                        {internship.links.map((link: any, i: number) => (
                                                            <a
                                                                key={i}
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-medium transition-all group"
                                                            >
                                                                <span className="truncate">{link.label}</span>
                                                                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center text-white/60 py-8">No internships found.</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
