"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitFork, Download, Terminal, Play, CheckCircle, Copy, FileText } from 'lucide-react';
import styles from './InteractiveSteps.module.css';

const steps = [
    {
        id: 1,
        title: "Fork Repository",
        description: "Create your own copy of the repository to make changes.",
        icon: <GitFork size={24} />,
        command: "Click 'Fork' on GitHub",
        color: "#3b82f6"
    },
    {
        id: 2,
        title: "Clone Locally",
        description: "Download the code to your local machine.",
        icon: <Download size={24} />,
        command: "git clone https://github.com/devpathindcommunity-india/DevPath-Web.git",
        color: "#8b5cf6"
    },
    {
        id: 3,
        title: "Install Dependencies",
        description: "Install all required packages.",
        icon: <Terminal size={24} />,
        command: "npm install",
        color: "#ec4899"
    },
    {
        id: 4,
        title: "Environment Setup",
        description: "Create .env.local and add your Firebase config.",
        icon: <FileText size={24} />,
        command: "cp .env.example .env.local",
        color: "#f59e0b"
    },
    {
        id: 5,
        title: "Run Dev Server",
        description: "Start the application locally.",
        icon: <Play size={24} />,
        command: "npm run dev",
        color: "#10b981"
    }
];

export default function InteractiveSteps() {
    const [activeStep, setActiveStep] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.stepsList}>
                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        className={`${styles.stepItem} ${index === activeStep ? styles.active : ''}`}
                        onClick={() => setActiveStep(index)}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className={styles.stepIcon} style={{ background: index === activeStep ? step.color : 'var(--glass-border)' }}>
                            {step.icon}
                        </div>
                        <div className={styles.stepContent}>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDesc}>{step.description}</p>
                        </div>
                        {index === activeStep && (
                            <motion.div
                                layoutId="activeIndicator"
                                className={styles.activeIndicator}
                                style={{ background: step.color }}
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            <div className={styles.previewWindow}>
                <div className={styles.windowHeader}>
                    <div className={styles.windowControls}>
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className={styles.windowTitle}>Terminal</div>
                </div>
                <div className={styles.windowBody}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={styles.commandContainer}
                        >
                            <span className={styles.prompt}>$</span>
                            <code className={styles.command}>{steps[activeStep].command}</code>
                            {steps[activeStep].id !== 1 && (
                                <button
                                    className={styles.copyButton}
                                    onClick={() => handleCopy(steps[activeStep].command)}
                                >
                                    {copied ? <CheckCircle size={16} color="#10b981" /> : <Copy size={16} />}
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    <div className={styles.cursor} />
                </div>
            </div>
        </div>
    );
}
