'use client';

import Image from 'next/image';
import { teamMembers, TeamMember } from '@/data/team';
import { Github, Linkedin, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeamPage() {
    // Group members by category
    const owner = teamMembers.filter(m => m.category === 'Owner');
    const coreAdmins = teamMembers.filter(m => m.category === 'Core Admin');
    const heads = teamMembers.filter(m => m.category === 'Head');
    const cityLeads = teamMembers.filter(m => m.category === 'City Lead');

    const MemberCard = ({ member }: { member: TeamMember }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
            <div className="aspect-square relative overflow-hidden">
                <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <div className="flex gap-4">
                        {member.socials?.github && (
                            <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                                <Github size={20} />
                            </a>
                        )}
                        {member.socials?.linkedin && (
                            <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                                <Linkedin size={20} />
                            </a>
                        )}
                        {member.socials?.instagram && (
                            <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                                <Instagram size={20} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
            <div className="p-4 text-center">
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-primary font-medium text-sm">{member.role}</p>
                {member.subRole && (
                    <p className="text-muted-foreground text-xs mt-1">{member.subRole}</p>
                )}
            </div>
        </motion.div>
    );

    return (
        <section className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Meet The Team
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    The passionate individuals driving the DevPath Community forward.
                </p>
            </div>

            <div className="space-y-16">
                {/* Owner Section */}
                {owner.length > 0 && (
                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-xs">
                            <MemberCard member={owner[0]} />
                        </div>
                    </div>
                )}

                {/* Core Admins */}
                {coreAdmins.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                            <span className="w-8 h-1 bg-primary rounded-full"></span>
                            Core Admins
                            <span className="w-8 h-1 bg-primary rounded-full"></span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {coreAdmins.map(member => (
                                <MemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Heads & Leads */}
                {heads.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                            <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                            Community Heads & Leads
                            <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                            {heads.map(member => (
                                <MemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    </div>
                )}

                {/* City Leads */}
                {cityLeads.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                            <span className="w-8 h-1 bg-cyan-500 rounded-full"></span>
                            City Leads
                            <span className="w-8 h-1 bg-cyan-500 rounded-full"></span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {cityLeads.map(member => (
                                <MemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
