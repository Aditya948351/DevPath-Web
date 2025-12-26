"use client";

import { Users, Sparkles, Globe } from 'lucide-react';
import styles from './Mission.module.css';

export default function Mission() {
    return (
        <section className={styles.mission}>
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-2 text-foreground">Our Mission</h2>
                {/* <p className="text-lg text-muted-foreground mb-8">हमारा मिशन</p> */}

                <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed">
                    To unite developers, innovators, and entrepreneurs in a collaborative ecosystem
                    that fosters innovation, knowledge sharing, and global recognition of technological excellence.
                </p>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-orange-600">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Collaborate</h3>
                        {/* <p className="text-sm text-muted-foreground mb-4">सहयोग</p> */}
                        <p className="text-muted-foreground">
                            Build meaningful connections and work together on impactful projects
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6 text-teal-600">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Innovate</h3>
                        {/* <p className="text-sm text-muted-foreground mb-4">नवाचार</p> */}
                        <p className="text-muted-foreground">
                            Push boundaries and create solutions that matter to the world
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                            <Globe size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Lead Globally</h3>
                        {/* <p className="text-sm text-muted-foreground mb-4">वैश्विक नेतृत्व</p> */}
                        <p className="text-muted-foreground">
                            Position our community as a leading technology innovation hub
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
