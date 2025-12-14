import { Calendar, Video } from 'lucide-react';
import styles from './Events.module.css';

const events = [
    {
        title: "Global Hackathon 2025",
        date: "Dec 15, 2025",
        time: "10:00 AM EST",
        speaker: "DevPath Team",
        type: "Hackathon",
        imageColor: "#3b82f6",
        urgent: true
    },
    {
        title: "Advanced System Design Workshop",
        date: "Dec 18, 2025",
        time: "2:00 PM EST",
        speaker: "Dr. Emily Chen",
        type: "Workshop",
        imageColor: "#8b5cf6",
        urgent: false
    },
    {
        title: "Future of AI in Development",
        date: "Dec 22, 2025",
        time: "11:00 AM EST",
        speaker: "Mark Zuckerberg",
        type: "Webinar",
        imageColor: "#10b981",
        urgent: false
    }
];

export default function Events() {
    return (
        <section className={styles.events}>
            <div className={styles.header}>
                <h2 className={styles.title}>Upcoming Events</h2>
                <p className={styles.subtitle}>
                    Join live sessions, workshops, and challenges to level up your skills.
                </p>
            </div>

            <div className={styles.timeline}>
                {events.map((event, index) => (
                    <div key={index} className={styles.eventCard}>
                        <div className={`${styles.cardContent} ${event.urgent ? styles.urgent : ''}`}>
                            <div
                                className={styles.thumbnail}
                                style={{ background: `linear-gradient(45deg, ${event.imageColor}, #1a1f35)` }}
                            />

                            <div className={styles.details}>
                                <div className={styles.dateBadge}>
                                    <Calendar size={14} />
                                    {event.date} • {event.time}
                                </div>

                                <h3 className={styles.eventTitle}>{event.title}</h3>

                                <div className={styles.speaker}>
                                    <div className={styles.speakerAvatar} />
                                    <span className={styles.speakerName}>Hosted by {event.speaker}</span>
                                </div>

                                <div className={styles.meta}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Video size={14} /> {event.type}
                                    </span>
                                    <button className={styles.rsvpButton}>
                                        RSVP Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
