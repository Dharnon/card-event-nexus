
import { useState, useEffect, useRef } from 'react';
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
  const refreshInProgressRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const subscriptionSetupRef = useRef(false);
  
  // Load event data only once on initial render
  useEffect(() => {
    if (!id || initialLoadDoneRef.current) return;
    
    initialLoadDoneRef.current = true;
    
    // Initial fetch of event
    const loadEventData = async () => {
      refreshInProgressRef.current = true;
      try {
        await refreshEvents();
        const currentEvent = getEventById(id);
        setEvent(currentEvent || null);
      } finally {
        refreshInProgressRef.current = false;
      }
    };
    
    loadEventData();
  }, [id, getEventById, refreshEvents]);
  
  // Setup real-time listener separately from the initial data load
  useEffect(() => {
    if (!id || subscriptionSetupRef.current) return;
    
    subscriptionSetupRef.current = true;
    console.log('Setting up real-time subscription for event:', id);
    
    // Setup real-time listener for changes to event registrations
    const channel = supabase
      .channel(`public:event_registrations:${id}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'event_registrations', filter: `event_id=eq.${id}` },
          async (payload) => {
            console.log('Registration change detected:', payload);
            
            // Only refresh if we're not already refreshing
            if (!refreshInProgressRef.current) {
              refreshInProgressRef.current = true;
              try {
                await refreshEvents();
                const updatedEvent = getEventById(id);
                setEvent(updatedEvent || null);
              } finally {
                refreshInProgressRef.current = false;
              }
            }
          }
      )
      .subscribe();
    
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
      subscriptionSetupRef.current = false;
    };
  }, [id, getEventById, refreshEvents]);
  
  if (!id) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EventRegistrationManager eventId={id} event={event} />
        </div>
      </main>
    </div>
  );
};

export default EventRegistrationsPage;
