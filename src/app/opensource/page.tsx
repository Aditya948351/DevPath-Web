"use client";

import { useState } from 'react';
import { Github, GitMerge, Globe, BookOpen, Code2, Users, ExternalLink, Star, Link as LinkIcon, Check, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GithubAuthProvider, linkWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import GitHubDashboard from '@/components/opensource/GitHubDashboard';

export default function OpenSourcePage() {
    const { user, updateUserProfile } = useAuth();
    const [connecting, setConnecting] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const handleConnectGitHub = async () => {
        if (!user) {
            alert("Please login to connect your GitHub account.");
            return;
        }

        setConnecting(true);
        try {
            const provider = new GithubAuthProvider();
            // Request access to read user data AND repos
            provider.addScope('read:user');
            provider.addScope('repo'); // Full control of private repositories

            const result = await linkWithPopup(auth.currentUser!, provider);
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;
            if (token) setAccessToken(token);

            const githubUser = result.user;

            // Extract GitHub data (some might be in providerData)
            const githubProfile = githubUser.providerData.find(p => p.providerId === 'github.com');

            if (githubProfile) {
                const githubData = {
                    githubStats: {
                        connected: true,
                        username: githubProfile.displayName || githubProfile.email || 'GitHub User',
                        photoURL: githubProfile.photoURL,
                        lastFetched: new Date().toISOString()
                    },
                    github: githubProfile.uid // Store GitHub UID or Username if available
                };

                // Update Firestore
                await updateUserProfile(githubData);
                alert("GitHub account connected successfully!");
            }

        } catch (error: any) {
            console.error("Error connecting GitHub:", error);
            if (error.code === 'auth/credential-already-in-use') {
                alert("This GitHub account is already connected to another user.");
            } else {
                alert("Failed to connect GitHub. " + error.message);
            }
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Hero Section */}
                <div className="text-center space-y-6 py-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20">
                        <Globe size={14} /> Open Source Ecosystem
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                        Connect, Contribute, and Grow
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
                        Open source is the heartbeat of modern software. Join the global community of developers building the future together.
                    </p>

                    {/* GitHub Connect Button */}
                    <div className="flex flex-col items-center gap-4 mt-8">
                        {user?.githubStats?.connected ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2 px-6 py-3 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 font-medium">
                                    <Check size={20} /> GitHub Connected as {user.githubStats.username}
                                </div>
                                {!accessToken && (
                                    <button
                                        onClick={handleConnectGitHub}
                                        className="text-sm text-muted-foreground hover:text-primary underline"
                                    >
                                        Reconnect to Manage Repos
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleConnectGitHub}
                                disabled={connecting}
                                className="flex items-center gap-2 px-6 py-3 bg-[#24292e] text-white rounded-full hover:bg-[#2f363d] transition-colors font-medium disabled:opacity-50"
                            >
                                <Github size={20} />
                                {connecting ? 'Connecting...' : 'Connect GitHub Account'}
                            </button>
                        )}
                    </div>
                </div>

                {/* GitHub Dashboard (Only visible when connected and token available) */}
                {accessToken && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <LayoutDashboard className="text-primary" /> GitHub Dashboard
                            </h2>
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20">
                                Live Connection
                            </span>
                        </div>
                        <GitHubDashboard accessToken={accessToken} />
                    </div>
                )}

                {/* Featured Repositories Section */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Star className="text-yellow-500" /> Featured Repositories
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Repo 1 */}
                        <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">DevPath Website</h3>
                                        <p className="text-xs text-muted-foreground">Official Community Website</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium bg-muted px-2 py-1 rounded">
                                    <Star size={12} className="text-yellow-500" /> 120+
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                The official website for the DevPath community, built with Next.js, Tailwind CSS, and Firebase.
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> TypeScript
                                </div>
                                <Link href="https://github.com/Aditya948351/DevPath-Community-Website" target="_blank" className="text-sm font-medium hover:underline flex items-center gap-1">
                                    View Code <ExternalLink size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Repo 2 */}
                        <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Code2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">DevPath CLI</h3>
                                        <p className="text-xs text-muted-foreground">Command Line Tool</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium bg-muted px-2 py-1 rounded">
                                    <Star size={12} className="text-yellow-500" /> 45+
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                A powerful CLI tool to help developers navigate their learning paths and access resources directly from the terminal.
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span> JavaScript
                                </div>
                                <Link href="#" className="text-sm font-medium hover:underline flex items-center gap-1">
                                    View Code <ExternalLink size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Repo 3 */}
                        <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Learning Resources</h3>
                                        <p className="text-xs text-muted-foreground">Curated Lists</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium bg-muted px-2 py-1 rounded">
                                    <Star size={12} className="text-yellow-500" /> 80+
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                A comprehensive collection of free learning resources, roadmaps, and guides for developers of all levels.
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Markdown
                                </div>
                                <Link href="#" className="text-sm font-medium hover:underline flex items-center gap-1">
                                    View Code <ExternalLink size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platforms Section */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Code2 className="text-primary" /> Major Platforms
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* GitHub */}
                        <div className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                            <div className="mb-4 p-3 bg-muted rounded-lg w-fit group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <Github size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">GitHub</h3>
                            <p className="text-muted-foreground mb-4">
                                The world's largest platform for developer collaboration. Home to millions of open source projects.
                            </p>
                            <Link href="https://github.com" target="_blank" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                                Visit Platform <ExternalLink size={14} />
                            </Link>
                        </div>

                        {/* GitLab */}
                        <div className="group bg-card border border-border rounded-xl p-6 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/5">
                            <div className="mb-4 p-3 bg-muted rounded-lg w-fit group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors">
                                <GitMerge size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">GitLab</h3>
                            <p className="text-muted-foreground mb-4">
                                A complete DevOps platform delivered as a single application. Famous for its CI/CD capabilities.
                            </p>
                            <Link href="https://gitlab.com" target="_blank" className="text-orange-500 text-sm font-medium flex items-center gap-1 hover:underline">
                                Visit Platform <ExternalLink size={14} />
                            </Link>
                        </div>

                        {/* Bitbucket */}
                        <div className="group bg-card border border-border rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                            <div className="mb-4 p-3 bg-muted rounded-lg w-fit group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                                <Code2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Bitbucket</h3>
                            <p className="text-muted-foreground mb-4">
                                Git solution for professional teams. Deeply integrated with Jira and Trello.
                            </p>
                            <Link href="https://bitbucket.org" target="_blank" className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:underline">
                                Visit Platform <ExternalLink size={14} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Getting Started Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Start Your Journey</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Learn the Basics</h3>
                                    <p className="text-muted-foreground">Understand Git, Pull Requests, and Issues. These are the fundamental tools of open source.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Find a Community</h3>
                                    <p className="text-muted-foreground">Look for projects with active maintainers and a welcoming community.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                                    <Star size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Make Your First Contribution</h3>
                                    <p className="text-muted-foreground">Start small. Fix a typo, update documentation, or tackle a "Good First Issue".</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                        <h3 className="font-bold text-xl mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="https://opensource.guide/how-to-contribute/" target="_blank" className="flex items-center justify-between p-3 bg-card rounded-lg hover:border-primary border border-transparent transition-colors group">
                                    <span className="font-medium">How to Contribute to Open Source</span>
                                    <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary" />
                                </Link>
                            </li>
                            <li>
                                <Link href="https://goodfirstissue.dev/" target="_blank" className="flex items-center justify-between p-3 bg-card rounded-lg hover:border-primary border border-transparent transition-colors group">
                                    <span className="font-medium">Good First Issues</span>
                                    <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary" />
                                </Link>
                            </li>
                            <li>
                                <Link href="https://firstcontributions.github.io/" target="_blank" className="flex items-center justify-between p-3 bg-card rounded-lg hover:border-primary border border-transparent transition-colors group">
                                    <span className="font-medium">First Contributions Guide</span>
                                    <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
