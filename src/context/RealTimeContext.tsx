'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AVATAR_API =
  process.env.NEXT_PUBLIC_AVATAR_API_URL ??
  'https://api.dicebear.com/7.x/avataaars/svg';

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  avatar: string;
}

interface RealTimeContextType {
  onlineUsers: number;
  activities: Activity[];
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(
  undefined
);

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState(325);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simulate online user count fluctuation
    const interval = setInterval(() => {
      setOnlineUsers((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate live activity feed
    const actions = [
      { action: 'completed', target: 'React Patterns Course' },
      { action: 'earned', target: 'Bug Hunter Badge' },
      { action: 'submitted', target: 'Portfolio Project' },
      { action: 'started', target: 'Node.js Path' },
      { action: 'posted', target: 'in General Chat' },
    ];

    const users = ['Alex', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa'];

    const interval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      const newActivity: Activity = {
        id: Date.now(),
        user: randomUser,
        action: randomAction.action,
        target: randomAction.target,
        time: 'Just now',
        avatar: `${AVATAR_API}?seed=${randomUser}`,
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, 5));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <RealTimeContext.Provider value={{ onlineUsers, activities }}>
      {children}
    </RealTimeContext.Provider>
  );
}

export function useRealTime() {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
}
