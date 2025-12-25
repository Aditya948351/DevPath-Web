"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Key, Lock } from 'lucide-react';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import AdminDashboard from '@/components/admin/AdminDashboard';

const SUPER_ADMIN_EMAIL = "devpathind.community@gmail.com";
const SUPER_ADMIN_PASSWORD = "Aditya@2006@#";

export default function SuperAdminLogin() {
    const { user } = useAuth();
    const router = useRouter();
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Redirect if not Super Admin email (after login)
    useEffect(() => {
        if (user && user.email !== SUPER_ADMIN_EMAIL) {
            router.push('/');
        } else if (user && user.email === SUPER_ADMIN_EMAIL) {
            // Check session key
            const sessionKey = sessionStorage.getItem('admin_session_key');
            if (sessionKey) {
                setIsAuthenticated(true);
            }
        }
    }, [user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Verify Key First
            const keyDoc = await getDoc(doc(db, 'superadmin_keys', 'config'));
            if (!keyDoc.exists() || keyDoc.data().value !== key.trim()) {
                setError("Invalid Security Key");
                setLoading(false);
                return;
            }

            sessionStorage.setItem('admin_session_key', key.trim());

            // 2. Authenticate with Firebase Auth
            // This is required for Firestore Rules to allow writes
            if (!auth.currentUser || auth.currentUser.email !== SUPER_ADMIN_EMAIL) {
                await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
            }

            setIsAuthenticated(true);

        } catch (err) {
            console.error(err);
            setError("Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    if (user && user.email !== SUPER_ADMIN_EMAIL) {
        return <div className="min-h-screen flex items-center justify-center">Unauthorized</div>;
    }

    if (isAuthenticated) {
        return <AdminDashboard initialAuth={true} />;
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Super Admin Access</h1>
                    <p className="text-zinc-400 mt-2">Restricted Area. Authorized Personnel Only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Security Key</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="password"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="Enter your secure key"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Access Console'} <Lock size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
