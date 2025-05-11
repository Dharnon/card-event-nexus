
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EventRegistrationManager from '@/components/store/EventRegistrationManager';
import { supabase } from '@/integrations/supabase/client';
import { useEvents } from '@/context/EventContext';
import { Event } from '@/types';

const EventRegistrationsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getEventById } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const channelRef = useRef<any>(null);
  const initialLoadDoneRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load event data just once on initial render
  useEffect(() => {
    if (!id || initialLoadDoneRef.current) return;
    
    initialLoadDoneRef.current = true;
    setIsLoading(true);
    
    // Initial fetch of event
    const loadEventData = async () => {
      try {
        const currentEvent = getEventById(id);
        setEvent(currentEvent || null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEventData();
  }, [id, getEventById]);
  
  // Setup real-time listener separately from the initial data load
  useEffect(() => {
    if (!id) return;
    
    console.log('Setting up real-time subscription for event:', id);
    
    // Setup real-time listener for changes to event registrations
    const channel = supabase
      .channel(`public:event_registrations:${id}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'event_registrations', filter: `event_id=eq.${id}` },
          async () => {
            console.log('Registration change detected for event:', id);
            const updatedEvent = getEventById(id);
            setEvent(updatedEvent || null);
          }
      )
      .subscribe();
    
    // Store the channel reference for cleanup
    channelRef.current = channel;
    
    return () => {
      console.log('Cleaning up real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [id, getEventById]);
  
  if (!id) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <p>Loading event details...</p>
            </div>
          ) : (
            <EventRegistrationManager eventId={id} event={event} />
          )}
        </div>
      </main>
    </div>
  );
};

export default EventRegistrationsPage;
