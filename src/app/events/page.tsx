import React from 'react';
import Events from '@/components/home/Events';

export default function EventsPage() {
    return (
        <main>
            <Events type="upcoming" />
            <Events type="past" />
        </main>
    );
}
