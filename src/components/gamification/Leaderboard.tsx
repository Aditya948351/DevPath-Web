'use client';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTier } from '@/lib/gamification';
import Image from 'next/image';

export function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'alltime' | 'weekly' | 'monthly'>(
    'alltime'
  );

  useEffect(() => {
    const field =
      filter === 'alltime'
        ? 'xp'
        : filter === 'weekly'
          ? 'weeklyXP'
          : 'monthlyXP';
    getDocs(
      query(collection(db, 'users'), orderBy(field, 'desc'), limit(20))
    ).then((snap) =>
    .catch(err => console.error(err))