"use client";

import React, { createContext, useContext, useState } from 'react';
import { Trophy } from 'lucide-react';



interface GamificationContextType {
    xp: number;
    level: number;
    addXp: (amount: number, reason: string) => void;
    notifications: { id: number; message: string; type: 'xp' | 'achievement' }[];
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [xp, setXp] = useState(125400);
    const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'xp' | 'achievement' }[]>([]);

    const level = Math.floor(Math.sqrt(xp / 100));

    const addXp = (amount: number, reason: string) => {
        setXp(prev => prev + amount);
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message: `+${amount} XP: ${reason}`, type: 'xp' }]);

        // Auto-remove notification
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    return (
        <GamificationContext.Provider value={{ xp, level, addXp, notifications }}>
            {children}

            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notifications.map(n => (
                    <div
                        key={n.id}
                        style={{
                            background: '#0f1419',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            animation: 'slideIn 0.3s ease-out'
                        }}
                    >
                        <div style={{ color: '#f59e0b' }}><Trophy size={16} /></div>
                        {n.message}
                    </div>
                ))}
            </div>
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
}
