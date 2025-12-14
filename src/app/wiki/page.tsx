"use client";

import { useState } from 'react';
import { Search, ChevronRight, Book, Code, FileText, HelpCircle, ThumbsUp, ThumbsDown, Github } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './Wiki.module.css';

const categories = [
    {
        title: "Getting Started",
        items: [
            { id: "intro", title: "Introduction to DevPath", icon: <Book size={16} /> },
            { id: "setup", title: "Setting Up Your Profile", icon: <FileText size={16} /> },
            { id: "xp", title: "Understanding XP System", icon: <HelpCircle size={16} /> }
        ]
    },
    {
        title: "Learning Paths",
        items: [
            { id: "react", title: "Full Stack React Guide", icon: <Code size={16} /> },
            { id: "python", title: "Python for AI Roadmap", icon: <Code size={16} /> }
        ]
    },
    {
        title: "Community",
        items: [
            { id: "guidelines", title: "Code of Conduct", icon: <FileText size={16} /> },
            { id: "contributing", title: "How to Contribute", icon: <Github size={16} /> }
        ]
    }
];

export default function WikiPage() {
    const [activeArticle, setActiveArticle] = useState("intro");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={16} />
                    <input
                        type="text"
                        placeholder="Search documentation..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <nav>
                    {categories.map((category, index) => (
                        <div key={index} className={styles.category}>
                            <h3 className={styles.categoryTitle}>{category.title}</h3>
                            {category.items.map(item => (
                                <div
                                    key={item.id}
                                    className={`${styles.navLink} ${activeArticle === item.id ? styles.active : ''}`}
                                    onClick={() => setActiveArticle(item.id)}
                                >
                                    {item.icon}
                                    {item.title}
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>

            <main className={styles.content}>
                <div className={styles.breadcrumb}>
                    <span>Docs</span>
                    <ChevronRight size={14} />
                    <span>Getting Started</span>
                    <ChevronRight size={14} />
                    <span>Introduction to DevPath</span>
                </div>

                <article>
                    <div className={styles.articleHeader}>
                        <h1 className={styles.title}>Introduction to DevPath</h1>
                        <div className={styles.meta}>
                            <span>Last updated: Dec 14, 2025</span>
                            <span>Reading time: 5 min</span>
                        </div>
                    </div>

                    <div className={styles.articleBody}>
                        <p>
                            Welcome to DevPath, the ultimate developer community designed to accelerate your growth through structured learning paths, real-world projects, and peer collaboration.
                        </p>

                        <h2>What is DevPath?</h2>
                        <p>
                            DevPath is more than just a learning platform. It&apos;s an ecosystem where you can:
                        </p>
                        <ul>
                            <li>Follow expert-curated <strong>Learning Paths</strong> to master new stacks.</li>
                            <li>Build and showcase <strong>Projects</strong> to build your portfolio.</li>
                            <li>Earn <strong>XP and Badges</strong> to track your progress and compete.</li>
                            <li>Connect with other developers in real-time.</li>
                        </ul>

                        <h2>Getting Started</h2>
                        <p>
                            To begin your journey, we recommend setting up your profile and choosing your first learning path.
                        </p>

                        <div className={styles.codeBlock}>
                            <button className={styles.copyButton}>Copy</button>
                            <pre>
                                <code>
                                    {`// Example: Starting your first path
const user = new User("DevNewbie");
await user.joinPath("Full Stack React");
console.log("Journey started! 🚀");`}
                                </code>
                            </pre>
                        </div>

                        <h3>Community Guidelines</h3>
                        <p>
                            We believe in a supportive and inclusive environment. Please review our Code of Conduct before participating in discussions.
                        </p>
                    </div>

                    <div className={styles.feedback}>
                        <span>Was this article helpful?</span>
                        <div className={styles.feedbackButtons}>
                            <Button variant="ghost" icon={<ThumbsUp size={16} />}>Yes</Button>
                            <Button variant="ghost" icon={<ThumbsDown size={16} />}>No</Button>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
