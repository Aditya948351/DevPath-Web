"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Calendar, Link as LinkIcon, Image as ImageIcon, Save, X } from 'lucide-react';

export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        registerLink: '',
        image: '',
        location: 'Online'
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'events'), orderBy('date', 'asc'));
            const snapshot = await getDocs(q);
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await updateDoc(doc(db, 'events', editingEvent.id), formData);
            } else {
                await addDoc(collection(db, 'events'), {
                    ...formData,
                    createdAt: new Date().toISOString()
                });
            }
            setIsModalOpen(false);
            setEditingEvent(null);
            setFormData({ title: '', description: '', date: '', registerLink: '', image: '', location: 'Online' });
            fetchEvents();
        } catch (error) {
            console.error("Error saving event:", error);
            alert("Failed to save event.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await deleteDoc(doc(db, 'events', id));
            fetchEvents();
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleEdit = (event: any) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date,
            registerLink: event.registerLink,
            image: event.image,
            location: event.location || 'Online'
        });
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Events</h1>
                <button
                    onClick={() => {
                        setEditingEvent(null);
                        setFormData({ title: '', description: '', date: '', registerLink: '', image: '', location: 'Online' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    <Plus size={20} /> Add Event
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading events...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                            <div className="h-48 bg-muted relative">
                                {event.image ? (
                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg line-clamp-1">{event.title}</h3>
                                    <span className="text-xs bg-muted px-2 py-1 rounded">{event.location}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2">
                                    <Calendar size={14} />
                                    {new Date(event.date).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                    <button onClick={() => handleEdit(event)} className="flex-1 flex items-center justify-center gap-1 text-sm bg-muted hover:bg-muted/80 py-2 rounded">
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(event.id)} className="flex-1 flex items-center justify-center gap-1 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 py-2 rounded">
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingEvent ? 'Edit Event' : 'New Event'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-2 bg-background border border-border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 bg-background border border-border rounded-md min-h-[100px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full p-2 bg-background border border-border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full p-2 bg-background border border-border rounded-md"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Register Link</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.registerLink}
                                    onChange={e => setFormData({ ...formData, registerLink: e.target.value })}
                                    className="w-full p-2 bg-background border border-border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full p-2 bg-background border border-border rounded-md"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg hover:bg-muted">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Save Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
