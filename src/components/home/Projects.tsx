"use client";

import { useRef } from 'react';
import { ProjectCard } from '../ProjectCard';
import styles from './Projects.module.css';
import { motion, useScroll, useTransform } from 'framer-motion';

const projects = [
    {
        title: "AI Code Assistant",
        author: "Sarah Chen",
        technologies: ["React", "Python", "OpenAI"],
        stats: { stars: 1240, forks: 350, views: "12k" },
        color: "#3b82f6",
        description: "An intelligent coding companion that helps developers write better code faster. Features include real-time syntax checking, automated refactoring suggestions, and natural language to code translation."
    },
    {
        title: "DeFi Dashboard",
        author: "Mike Johnson",
        technologies: ["Vue", "Web3", "Solidity"],
        stats: { stars: 850, forks: 120, views: "8k" },
        color: "#10b981",
        description: "A comprehensive dashboard for tracking decentralized finance investments. Supports multiple wallets, real-time price updates, and yield farming analytics."
    },
    {
        title: "Real-time Chat App",
        author: "Alex Rivera",
        technologies: ["Next.js", "Socket.io"],
        stats: { stars: 2100, forks: 500, views: "25k" },
        color: "#8b5cf6",
        description: "Scalable chat application capable of handling millions of concurrent connections. Features end-to-end encryption, file sharing, and voice messages."
    },
    {
        title: "E-commerce Platform",
        author: "Emily Zhang",
        technologies: ["Angular", "Node.js"],
        stats: { stars: 980, forks: 230, views: "10k" },
        color: "#f59e0b",
        description: "Full-featured e-commerce solution with inventory management, payment processing, and customer analytics dashboard."
    },
    {
        title: "DevOps Pipeline Tool",
        author: "David Kim",
        technologies: ["Go", "Docker", "K8s"],
        stats: { stars: 1500, forks: 400, views: "15k" },
        color: "#ec4899",
        description: "Automated CI/CD pipeline generator for microservices architectures. Simplifies deployment to Kubernetes clusters."
    },
    {
        title: "Mobile Fitness App",
        author: "Lisa Park",
        technologies: ["React Native", "Firebase"],
        stats: { stars: 3200, forks: 800, views: "40k" },
        color: "#6366f1",
        description: "Cross-platform fitness tracking application with social features, workout plans, and integration with wearable devices."
    }
];

export default function Projects() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section className={styles.projects}>
            <div className={styles.header}>
                <h2 className={styles.title}>Community Showcase</h2>
                <p className={styles.subtitle}>
                    Discover incredible projects built by developers like you.
                </p>
            </div>

            <div className={styles.scrollContainer} ref={containerRef}>
                <div className={styles.grid}>
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            className={styles.projectWrapper}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{
                                scale: 1.05,
                                rotateY: 5,
                                zIndex: 10
                            }}
                            style={{ perspective: 1000 }}
                        >
                            <ProjectCard project={project} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
