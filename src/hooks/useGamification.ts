import { useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // your existing firebase init
import { todayString } from '@/lib/streaks';
import { XP_VALUES } from '@/lib/gamification';

export function useGamification(userId: string) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, 'members', userId)).then((snap) => setProfile(snap.data()));
    .catch(err => console.error(err))