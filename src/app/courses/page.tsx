"use client";

import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, Code, Server, Layers, Rocket, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CoursesPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/20">
            <Navbar />

            <main className="pb-20 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    {/* Hero Section */}
                    <div className="text-center mb-20 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary mb-6">
                                <Sparkles size={16} />
                                <span>Coming March 2025</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400 tracking-tight">
                                Master Full Stack<br />Development
                            </h1>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                                A complete, free, and industry-recognized curriculum designed to take you from zero to hero. No paid courses, no scattered tutorials.
                            </p>
                        </motion.div>
                    </div>

                    {/* Learning Paths Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-24">
                        {/* Frontend */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-8 hover:border-primary/30 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                                    <Code size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Frontend Development</h3>
                                <p className="text-slate-400 mb-6">
                                    Build beautiful, interactive user interfaces. Master the art of crafting responsive web experiences.
                                </p>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-blue-500" /> HTML5 & Semantic Web
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-blue-500" /> Modern CSS & Tailwind
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-blue-500" /> JavaScript (ES6+)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-blue-500" /> React & Next.js
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                        {/* Backend */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                    <Server size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Backend Development</h3>
                                <p className="text-slate-400 mb-6">
                                    Power your applications with robust server-side logic, databases, and APIs.
                                </p>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-purple-500" /> Node.js & Express
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-purple-500" /> Python & Django/FastAPI
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-purple-500" /> SQL & NoSQL Databases
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-purple-500" /> API Design & Security
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                        {/* Full Stack */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-8 hover:border-green-500/30 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
                                    <Layers size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Full Stack</h3>
                                <p className="text-slate-400 mb-6">
                                    Combine frontend and backend skills to build complete, production-ready applications.
                                </p>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-500" /> End-to-End Development
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-500" /> Deployment & DevOps
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-500" /> System Architecture
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-500" /> Real-world Projects
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>

                    {/* Timeline & Features Section */}
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Launch Timeline
                            </h2>
                            <div className="relative border-l border-white/10 pl-8 space-y-10">
                                <div className="relative">
                                    <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-primary border-4 border-[#0a0a0a]" />
                                    <span className="text-sm font-bold text-primary mb-1 block">MARCH 2025</span>
                                    <h4 className="text-xl font-bold mb-2">The Foundation</h4>
                                    <p className="text-slate-400">
                                        We kick off with the HTML Masterclass, followed immediately by CSS Styling & Layouts. The perfect start for beginners.
                                    </p>
                                </div>
                                <div className="relative">
                                    <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-slate-700 border-4 border-[#0a0a0a]" />
                                    <span className="text-sm font-bold text-slate-500 mb-1 block">APRIL 2025</span>
                                    <h4 className="text-xl font-bold mb-2">Logic & Programming</h4>
                                    <p className="text-slate-400">
                                        Python Programming and JavaScript Essentials. Learn to think like a programmer.
                                    </p>
                                </div>
                                <div className="relative">
                                    <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-slate-700 border-4 border-[#0a0a0a]" />
                                    <span className="text-sm font-bold text-slate-500 mb-1 block">MAY 2025</span>
                                    <h4 className="text-xl font-bold mb-2">Advanced Frameworks</h4>
                                    <p className="text-slate-400">
                                        Deep dive into React, Next.js, and Backend technologies.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10"
                        >
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <GraduationCap className="text-yellow-400" />
                                Why DevPath?
                            </h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Rocket size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Industry-Recognized Certificates</h4>
                                        <p className="text-sm text-slate-400">Earn free, verified certificates upon completion to showcase on your resume and LinkedIn.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Project-Based Learning</h4>
                                        <p className="text-sm text-slate-400">Don't just watch tutorials. Build real-world applications that matter.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Code size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Completely Free</h4>
                                        <p className="text-sm text-slate-400">Quality education should be accessible to everyone. No hidden fees, ever.</p>
                                    </div>
                                </li>
                            </ul>

                            <div className="mt-8 pt-8 border-t border-white/10">
                                <button className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group">
                                    Get Notified When We Launch
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
