"use client";

import { MessageCircle, Code2, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

export default function Groups() {
    const groups = [
        {
            icon: <MessageCircle size={32} />,
            title: "General Discussion",
            description: "Connect with developers worldwide, share knowledge, ask questions, and stay updated with the latest tech trends.",
            color: "bg-blue-500",
            link: "https://chat.whatsapp.com/D2PRfQy4HYgC4XURhY2X8C" // Using existing link as placeholder
        },
        {
            icon: <Code2 size={32} />,
            title: "Hackathons & Open Source",
            description: "Team up for hackathons, discover open source projects, and collaborate on building the future of tech.",
            color: "bg-purple-500",
            link: "https://chat.whatsapp.com/D2PRfQy4HYgC4XURhY2X8C" // Using existing link as placeholder
        }
    ];

    return (
        <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Community Groups</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Join our focused groups to connect with like-minded developers and accelerate your growth.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {groups.map((group, index) => (
                        <div key={index} className="p-8 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg group">
                            <div className={`w-14 h-14 ${group.color} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                                {group.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{group.title}</h3>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                {group.description}
                            </p>
                            <a href={group.link} target="_blank" rel="noopener noreferrer" className="block">
                                <Button variant="secondary" className="w-full justify-between group-hover:bg-primary group-hover:text-white transition-colors">
                                    Join Now <ArrowRight size={18} />
                                </Button>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
