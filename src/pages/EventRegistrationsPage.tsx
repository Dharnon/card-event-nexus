
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EventRegistrationManager from '@/components/store/EventRegistrationManager';
import { supabase } from '@/integrations/supabase/client';
import { useEvents } from '@/context/EventContext';
import { Event } from '@/types';

const EventRegistrationsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getEventById, refreshEvents } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  
  useEffect(() => {
    if (!id) return;
    
    // Initial fetch of event
    const loadEventData = async () => {
      const currentEvent = getEventById(id);
      setEvent(currentEvent || null);
    };
    
    loadEventData();
    
    // Setup real-time listener for changes to event registrations
    const channel = supabase
      .channel(`public:event_registrations:${id}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'event_registrations', filter: `event_id=eq.${id}` },
          async (payload) => {
            console.log('Registration change detected:', payload);
            // Avoid calling refreshEvents multiple times in quick succession
            await refreshEvents();
            const updatedEvent = getEventById(id);
            setEvent(updatedEvent || null);
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, getEventById, refreshEvents]);
  
  if (!id) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EventRegistrationManager />
        </div>
      </main>
    </div>
  );
};

export default EventRegistrationsPage;
