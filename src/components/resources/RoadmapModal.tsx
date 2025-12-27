import { X, CheckCircle, BookOpen, Code, Database, Brain, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapModalProps {
    isOpen: boolean;
    onClose: () => void;
    roadmap: {
        title: string;
        phases: {
            title: string;
            duration: string;
            icon: any;
            items: {
                subtitle: string;
                points: string[];
            }[];
        }[];
    } | null;
}

export function RoadmapModal({ isOpen, onClose, roadmap }: RoadmapModalProps) {
    if (!isOpen || !roadmap) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl custom-scrollbar"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-card/95 backdrop-blur">
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                                {roadmap.title}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">Placement Focused Roadmap</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-8">
                        {roadmap.phases.map((phase, index) => (
                            <div key={index} className="relative pl-8 border-l-2 border-border last:border-l-0 pb-8 last:pb-0">
                                {/* Phase Marker */}
                                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                        {phase.icon}
                                        {phase.title}
                                    </h3>
                                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded mt-2 inline-block">
                                        {phase.duration}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {phase.items.map((item, i) => (
                                        <div key={i} className="bg-muted/30 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors">
                                            <h4 className="font-semibold text-foreground mb-3 flex items-start gap-2">
                                                <CheckCircle size={16} className="text-green-500 mt-1 shrink-0" />
                                                {item.subtitle}
                                            </h4>
                                            <ul className="space-y-2">
                                                {item.points.map((point, j) => (
                                                    <li key={j} className="text-sm text-muted-foreground pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-muted-foreground/50">
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Final CTA */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 text-center">
                            <h3 className="text-lg font-bold mb-2">Need Expert Guidance?</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Join the Coders Circle Community on WhatsApp for mentorship and doubts.
                            </p>
                            <a
                                href="https://chat.whatsapp.com/your-group-link" // Replace with actual link if available
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-colors"
                            >
                                <MessageSquare size={18} /> Join Community
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

import { MessageSquare } from 'lucide-react';
