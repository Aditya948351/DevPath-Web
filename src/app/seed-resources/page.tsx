"use client";

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { internshipData } from '@/data/internshipData';

export default function SeedResourcesPage() {
    const [status, setStatus] = useState('Idle');

    const seedInternships = async () => {
        setStatus('Seeding...');
        try {
            await setDoc(doc(db, 'resources', 'Internship_Calendar_2026'), {
                ...internshipData,
                starCount: 0,
                createdAt: new Date().toISOString()
            });
            setStatus('Success! Internship Calendar seeded.');
        } catch (error) {
            console.error(error);
            setStatus('Error: ' + (error as any).message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
            <h1 className="text-2xl font-bold">Seed Resources</h1>
            <p>Status: {status}</p>
            <button
                onClick={seedInternships}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
                Seed Internship Calendar
            </button>
        </div>
    );
}
