import { ReactNode } from 'react';

export type WikiArticle = {
    id: string;
    title: string;
    lastUpdated: string;
    readingTime: string;
    content: ReactNode;
};

export const wikiContent: Record<string, WikiArticle> = {
    intro: {
        id: "intro",
        title: "Introduction to DevPath",
        lastUpdated: "Dec 14, 2025",
        readingTime: "5 min",
        content: (
            <>
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
            </>
        )
    },
    "city-leads": {
        id: "city-leads",
        title: "City Leads",
        lastUpdated: "Dec 26, 2025",
        readingTime: "3 min",
        content: (
            <>
                <p>
                    City Leads are the backbone of our local communities. They are passionate individuals who bridge the gap between DevPath and developers in their specific regions.
                </p>
                <h2>Responsibilities</h2>
                <ul>
                    <li><strong>Community Building:</strong> Organize local meetups, workshops, and hackathons to foster a strong local developer network.</li>
                    <li><strong>Mentorship:</strong> Guide new members, answer queries, and provide support to learners in their city.</li>
                    <li><strong>Brand Ambassadorship:</strong> Represent DevPath at local events and colleges, spreading the word about our mission.</li>
                    <li><strong>Feedback Loop:</strong> Gather feedback from the local community and relay it to the core team to improve the platform.</li>
                </ul>
                <h2>How to Become a City Lead?</h2>
                <p>
                    We look for active contributors who have demonstrated leadership and a passion for helping others. Keep an eye out for our quarterly applications!
                </p>
            </>
        )
    },
    "technical-heads": {
        id: "technical-heads",
        title: "Technical Heads",
        lastUpdated: "Dec 26, 2025",
        readingTime: "4 min",
        content: (
            <>
                <p>
                    Technical Heads are the subject matter experts within DevPath. They ensure the quality and relevance of our technical content and projects.
                </p>
                <h2>What They Do</h2>
                <ul>
                    <li><strong>Curriculum Design:</strong> Create and update Learning Paths to reflect the latest industry trends and best practices.</li>
                    <li><strong>Project Review:</strong> Evaluate project submissions, providing constructive feedback to help members improve their code.</li>
                    <li><strong>Technical Workshops:</strong> Conduct deep-dive sessions on advanced topics, tools, and frameworks.</li>
                    <li><strong>Open Source Maintainers:</strong> Oversee DevPath&apos;s open-source repositories, reviewing PRs and guiding contributors.</li>
                </ul>
            </>
        )
    },
    "community-offerings": {
        id: "community-offerings",
        title: "What Community Offers",
        lastUpdated: "Dec 26, 2025",
        readingTime: "3 min",
        content: (
            <>
                <p>
                    Joining the DevPath community unlocks a world of opportunities for your career and personal growth.
                </p>
                <h2>Key Benefits</h2>
                <ul>
                    <li><strong>Structured Learning:</strong> Access to comprehensive roadmaps for various tech stacks (MERN, Python/AI, etc.).</li>
                    <li><strong>Peer Learning:</strong> Collaborate with like-minded developers, pair program, and solve problems together.</li>
                    <li><strong>Career Support:</strong> Resume reviews, mock interviews, and job referrals from our partner network.</li>
                    <li><strong>Exclusive Events:</strong> Priority access to hackathons, webinars, and tech talks by industry experts.</li>
                    <li><strong>Recognition:</strong> Earn badges, climb the leaderboard, and get recognized for your contributions.</li>
                </ul>
            </>
        )
    },
    "hackfiesta": {
        id: "hackfiesta",
        title: "About HackFiesta",
        lastUpdated: "Dec 26, 2025",
        readingTime: "4 min",
        content: (
            <>
                <p>
                    HackFiesta is DevPath&apos;s flagship annual hackathon, bringing together the brightest minds to innovate and build solutions for real-world problems.
                </p>
                <h2>Event Highlights</h2>
                <ul>
                    <li><strong>48-Hour Sprint:</strong> An intense weekend of coding, designing, and pitching.</li>
                    <li><strong>Mentorship:</strong> Access to mentors from top tech companies who provide guidance throughout the event.</li>
                    <li><strong>Prizes & Swag:</strong> Exciting cash prizes, gadgets, and exclusive DevPath swag for winners and participants.</li>
                    <li><strong>Networking:</strong> A chance to connect with potential employers, co-founders, and fellow hackers.</li>
                </ul>
                <p>
                    Stay tuned to our Events page for the next HackFiesta announcement!
                </p>
            </>
        )
    },
    "wp-community": {
        id: "wp-community",
        title: "WhatsApp Community",
        lastUpdated: "Dec 26, 2025",
        readingTime: "2 min",
        content: (
            <>
                <p>
                    Our WhatsApp Community is the fastest way to stay updated and connect with the DevPath family instantly.
                </p>
                <h2>Why Join?</h2>
                <ul>
                    <li><strong>Instant Updates:</strong> Get real-time notifications about new projects, events, and announcements.</li>
                    <li><strong>Quick Help:</strong> Stuck on a bug? Post it in the group and get help from fellow developers.</li>
                    <li><strong>Daily Discussions:</strong> Participate in daily tech discussions, polls, and quizzes.</li>
                </ul>
                <p>
                    <strong>Note:</strong> We maintain strict community guidelines to ensure a spam-free and respectful environment.
                </p>
            </>
        )
    },
    "open-source": {
        id: "open-source",
        title: "Open Source at DevPath",
        lastUpdated: "Dec 26, 2025",
        readingTime: "5 min",
        content: (
            <>
                <p>
                    Open Source is at the heart of DevPath. We believe in building in public and giving back to the community.
                </p>
                <h2>Our Philosophy</h2>
                <p>
                    We encourage all members to contribute to open source, whether it&apos;s DevPath&apos;s own repositories or other popular projects. It&apos;s the best way to learn real-world software development.
                </p>
                <h2>How to Get Involved</h2>
                <ul>
                    <li><strong>Explore Repos:</strong> Check out our <a href="/opensource" className="text-primary hover:underline">Open Source Dashboard</a> to find active projects.</li>
                    <li><strong>Pick an Issue:</strong> Look for &quot;good first issue&quot; tags if you are just starting out.</li>
                    <li><strong>Submit a PR:</strong> Fork the repo, make your changes, and submit a Pull Request. Our maintainers will review it.</li>
                </ul>
                <h2>Rewards</h2>
                <p>
                    Contributors earn special <strong>Open Source Badges</strong> and extra XP for every merged PR!
                </p>
            </>
        )
    },
    "setup": {
        id: "setup",
        title: "Setting Up Your Profile",
        lastUpdated: "Dec 14, 2025",
        readingTime: "3 min",
        content: (
            <>
                <p>Setting up your profile is the first step to joining the DevPath ecosystem.</p>
                <h2>Steps</h2>
                <ol>
                    <li><strong>Complete your Bio:</strong> Let others know who you are and what you do.</li>
                    <li><strong>Link GitHub:</strong> Connect your GitHub account to showcase your repositories.</li>
                    <li><strong>Add Skills:</strong> List your technical skills to get relevant project recommendations.</li>
                </ol>
            </>
        )
    },
    "xp": {
        id: "xp",
        title: "Understanding XP System",
        lastUpdated: "Dec 14, 2025",
        readingTime: "4 min",
        content: (
            <>
                <p>XP (Experience Points) gamifies your learning journey on DevPath.</p>
                <h2>How to Earn XP</h2>
                <ul>
                    <li><strong>Daily Login:</strong> Earn points for consistency.</li>
                    <li><strong>Completing Projects:</strong> Get major XP boosts for finishing projects.</li>
                    <li><strong>Open Source:</strong> Merged PRs give you significant XP.</li>
                </ul>
            </>
        )
    },
    "react": {
        id: "react",
        title: "Full Stack React Guide",
        lastUpdated: "Dec 14, 2025",
        readingTime: "10 min",
        content: (
            <>
                <p>Master the MERN stack with our comprehensive guide.</p>
                <h2>Curriculum</h2>
                <ul>
                    <li>React Basics & Hooks</li>
                    <li>State Management (Redux/Zustand)</li>
                    <li>Node.js & Express</li>
                    <li>MongoDB & Mongoose</li>
                </ul>
            </>
        )
    },
    "python": {
        id: "python",
        title: "Python for AI Roadmap",
        lastUpdated: "Dec 14, 2025",
        readingTime: "12 min",
        content: (
            <>
                <p>From Python basics to building Neural Networks.</p>
                <h2>Curriculum</h2>
                <ul>
                    <li>Python Syntax & Data Structures</li>
                    <li>NumPy & Pandas</li>
                    <li>Scikit-Learn</li>
                    <li>TensorFlow/PyTorch</li>
                </ul>
            </>
        )
    },
    "guidelines": {
        id: "guidelines",
        title: "Code of Conduct",
        lastUpdated: "Dec 14, 2025",
        readingTime: "5 min",
        content: (
            <>
                <p>We are committed to providing a friendly, safe and welcoming environment for all.</p>
                <h2>Our Standards</h2>
                <ul>
                    <li>Be respectful and inclusive.</li>
                    <li>No harassment or discrimination.</li>
                    <li>Constructive criticism only.</li>
                </ul>
            </>
        )
    },
    "contributing": {
        id: "contributing",
        title: "How to Contribute",
        lastUpdated: "Dec 14, 2025",
        readingTime: "6 min",
        content: (
            <>
                <p>We welcome contributions from the community!</p>
                <h2>Steps</h2>
                <ol>
                    <li>Fork the repository.</li>
                    <li>Create a feature branch.</li>
                    <li>Commit your changes.</li>
                    <li>Push to the branch.</li>
                    <li>Open a Pull Request.</li>
                </ol>
            </>
        )
    },

};
