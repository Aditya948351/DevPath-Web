"use client";

import { Calendar, ArrowRight, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function InternshipCalendarCard() {
    const router = useRouter();

    const handleClick = () => {
        router.push('/resources?open=internship-calendar');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleClick}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl cursor-pointer h-full min-h-[300px] flex flex-col"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors duration-500" />

            <div className="relative z-10 p-8 flex flex-col h-full">
                {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium border border-purple-500/20 w-fit mb-6">
                    <Briefcase size={14} />
                    <span>New Year Featured resource</span>
                </div> */}

                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                    Internship Calendar <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">2026</span>
                </h3>

                <p className="text-slate-400 text-lg mb-8 flex-grow">
                    Track upcoming opportunities, deadlines, and eligibility for top tech companies. Never miss an application window.
                </p>

                <div className="flex items-center gap-2 text-white font-semibold group-hover:translate-x-2 transition-transform duration-300 mt-auto">
                    View Calendar <ArrowRight size={20} className="text-purple-400" />
                </div>
            </div>

            {/* Decorative Calendar Icon */}
            <Calendar
                className="absolute -bottom-6 -right-6 text-white/5 group-hover:text-white/10 transition-colors duration-500 transform -rotate-12 group-hover:rotate-0 group-hover:scale-110"
                size={180}
                strokeWidth={1}
            />
        </motion.div>
    );
}
