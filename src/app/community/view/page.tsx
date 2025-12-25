"use client";

import { Suspense } from 'react';
import DiscussionViewClient from './client';

export default function DiscussionViewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <DiscussionViewClient />
        </Suspense>
    );
}
