
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Lock, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminKeyModalProps {
    isOpen: boolean;
    onVerified: () => void;
    onCancel: () => void;
}

import { useAuth } from '@/context/AuthContext';
export default function AdminKeyModal({ isOpen, onVerified, onCancel }: AdminKeyModalProps) {
    const { verifyAdmin } = useAuth();
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [configKey, setConfigKey] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Fetch the correct key from Firestore
            const fetchKey = async () => {
                try {
                    const docRef = doc(db, 'admin_keys', 'config');
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setConfigKey(docSnap.data().value);
                    } else {
                        console.error('Admin key config not found');
                        setError('System error: Could not verify key.');
                    }
                } catch (err) {
                    console.error('Error fetching admin key:', err);
                    setError('Network error. Please try again.');
                }
            };
            fetchKey();
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate a small delay for better UX
        setTimeout(() => {
            if (key === configKey) {
                verifyAdmin();
                onVerified();
            } else {
                setError('Invalid Admin Key. Please try again.');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex flex-col items-center mb-6 text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Admin Verification</h2>
                                <p className="text-muted-foreground mt-2">
                                    Please enter the Admin Key to continue.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Admin Key</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="password"
                                            value={key}
                                            onChange={(e) => setKey(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Enter key..."
                                            autoFocus
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !configKey}
                                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            'Verify'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
