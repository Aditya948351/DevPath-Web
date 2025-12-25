"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Github, Linkedin, Instagram, ArrowRight, MapPin, Key } from 'lucide-react';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// const ADMIN_KEY = "DEVPATH_CORE_2025"; // Removed in favor of dynamic key

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [github, setGithub] = useState('');
    const [instagram, setInstagram] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [isAdminSignup, setIsAdminSignup] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, isLoading } = useAuth(); // Import useAuth

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    useEffect(() => {
        if (user) {
            router.push('/profile');
        }
    }, [user, router]);

    if (user) return null;

    const checkIsAdminEmail = async (emailToCheck: string) => {
        if (!emailToCheck) return;
        try {
            const adminDoc = await getDoc(doc(db, 'admins', emailToCheck));
            if (adminDoc.exists()) {
                setIsAdminSignup(true);
            } else {
                setIsAdminSignup(false);
            }
        } catch (err) {
            console.error("Error checking admin email:", err);
        }
    };

    const handleEmailBlur = () => {
        checkIsAdminEmail(email);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isAdminSignup) {
                // Fetch dynamic admin key
                const keyDoc = await getDoc(doc(db, 'admin_keys', 'config'));
                if (!keyDoc.exists()) {
                    throw new Error("System Configuration Error: Admin Key not found.");
                }
                const currentAdminKey = keyDoc.data().value;

                if (adminKey !== currentAdminKey) {
                    throw new Error("Invalid Admin Key. Please contact the Super Admin.");
                }
            }

            // 1. Create Authentication User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Profile Name
            await updateProfile(user, { displayName: name });

            // 3. Create Document in Firestore
            if (isAdminSignup) {
                // For admins, we update the existing doc with uid and other details if needed, 
                // or just ensure they can access it. 
                // The 'admins' collection is already seeded. We might want to add the UID to it.
                await setDoc(doc(db, 'admins', email), {
                    uid: user.uid, // Link Auth UID to Admin Doc
                    mobile: `${countryCode} ${mobile}`,
                    state,
                    city,
                    district,
                    linkedin,
                    github,
                    instagram,
                    // Preserve existing fields if any (merge is true by default for setDoc if we use { merge: true } but here we want to overwrite/add)
                    // Actually, let's use merge to not lose seeded data like role/name if they match
                }, { merge: true });
            } else {
                // Member Signup
                await setDoc(doc(db, 'members', user.uid), {
                    uid: user.uid,
                    name,
                    email,
                    mobile: `${countryCode} ${mobile}`,
                    state,
                    city,
                    district,
                    linkedin,
                    github,
                    instagram,
                    role: 'member',
                    createdAt: new Date().toISOString(),
                    xp: 0,
                    rank: 0,
                    streak: 0,
                    projects: 0
                });
            }

            router.push('/profile');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Left Side - Form */}
                <div className="p-8 flex-1 overflow-y-auto max-h-[90vh]">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Join DevPath</h1>
                        <p className="text-muted-foreground">Start your developer journey today.</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={handleEmailBlur}
                                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                            {isAdminSignup && (
                                <p className="text-xs text-blue-500 mt-1">Admin email detected. Admin Key required.</p>
                            )}
                        </div>

                        {isAdminSignup && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20"
                            >
                                <label className="block text-sm font-medium mb-1 text-blue-500">Admin Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                    <input
                                        type="password"
                                        value={adminKey}
                                        onChange={(e) => setAdminKey(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 bg-background border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter Admin Key"
                                        required={isAdminSignup}
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Mobile Number</label>
                            <div className="flex gap-2">
                                <div className="relative w-24">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-full px-2 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                    >
                                        <option value="+91">+91 (IN)</option>
                                        <option value="+1">+1 (US)</option>
                                        <option value="+44">+44 (UK)</option>
                                        <option value="+61">+61 (AU)</option>
                                        <option value="+81">+81 (JP)</option>
                                        <option value="+86">+86 (CN)</option>
                                        <option value="+49">+49 (DE)</option>
                                        <option value="+33">+33 (FR)</option>
                                    </select>
                                </div>
                                <div className="relative flex-1">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        type="tel"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="98765 43210"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">State</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="State"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="City"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">District</label>
                                <input
                                    type="text"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="District"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="url"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="https://linkedin.com/in/username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">GitHub URL</label>
                            <div className="relative">
                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="url"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="https://github.com/username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Instagram URL</label>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="url"
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="https://instagram.com/username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Login
                        </Link>
                    </div>
                </div>

                {/* Right Side - Community & Socials */}
                <div className="bg-muted p-8 flex-1 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold mb-4">Join the Community</h2>
                    <p className="text-muted-foreground mb-8">
                        Connect with 50,000+ developers. Follow us to stay updated with the latest events and resources.
                    </p>

                    <div className="space-y-4">
                        <a
                            href="https://www.linkedin.com/company/devpath-community/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-accent transition-colors group"
                        >
                            <div className="p-2 bg-[#0077b5]/10 rounded-full text-[#0077b5] group-hover:bg-[#0077b5] group-hover:text-white transition-colors">
                                <Linkedin size={20} />
                            </div>
                            <div>
                                <div className="font-semibold">LinkedIn</div>
                                <div className="text-xs text-muted-foreground">Follow for professional updates</div>
                            </div>
                        </a>

                        <a
                            href="https://www.instagram.com/devpath_community/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-accent transition-colors group"
                        >
                            <div className="p-2 bg-[#E1306C]/10 rounded-full text-[#E1306C] group-hover:bg-[#E1306C] group-hover:text-white transition-colors">
                                <Instagram size={20} />
                            </div>
                            <div>
                                <div className="font-semibold">Instagram</div>
                                <div className="text-xs text-muted-foreground">Follow for community highlights</div>
                            </div>
                        </a>

                        <a
                            href="https://github.com/devpathindcommunity-india"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-accent transition-colors group"
                        >
                            <div className="p-2 bg-foreground/10 rounded-full text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                                <Github size={20} />
                            </div>
                            <div>
                                <div className="font-semibold">GitHub</div>
                                <div className="text-xs text-muted-foreground">Star our open source projects</div>
                            </div>
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
