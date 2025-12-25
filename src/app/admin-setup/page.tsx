
"use client";

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const SUPER_ADMIN_EMAIL = "devpathind.community@gmail.com";
const SUPER_ADMIN_PASSWORD = "Aditya@2006@#";

export default function AdminSetup() {
    const [status, setStatus] = useState('Idle');
    const router = useRouter();

    const setupAdmin = async () => {
        setStatus('Processing...');
        try {
            let userCredential;
            try {
                // Try login first
                userCredential = await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
                setStatus('Logged in. Setting up Firestore...');
            } catch (error: any) {
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                    // Try creating
                    setStatus('User not found. Creating...');
                    userCredential = await createUserWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
                } else {
                    throw error;
                }
            }

            const user = userCredential.user;
            await updateProfile(user, { displayName: "Super Admin" });

            // Create Admin Doc
            await setDoc(doc(db, 'admins', SUPER_ADMIN_EMAIL), {
                uid: user.uid,
                email: SUPER_ADMIN_EMAIL,
                name: "Super Admin",
                role: "admin",
                isSuperAdmin: true,
                createdAt: new Date().toISOString()
            }, { merge: true });

            setStatus('Success! Redirecting...');
            setTimeout(() => router.push('/ap'), 1500);

        } catch (error: any) {
            console.error(error);
            setStatus('Error: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Super Admin Setup</h1>
            <p className="text-muted-foreground">Click below to initialize the Super Admin account.</p>
            <button
                onClick={setupAdmin}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium"
            >
                Initialize Super Admin
            </button>
            <p className="font-mono text-sm">{status}</p>
        </div>
    );
}
