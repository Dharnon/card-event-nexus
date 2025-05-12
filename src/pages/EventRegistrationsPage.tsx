
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EventRegistrationManager from '@/components/store/EventRegistrationManager';
import { supabase } from '@/integrations/supabase/client';
import { useEvents } from '@/context/EventContext';
import { Event } from '@/types';
import { getEventById, getRegistrations } from '@/services/EventService';

const EventRegistrationsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { refreshEvents } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const channelRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadEventData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // Fetch event data directly from the database
        const eventData = await getEventById(id);
        if (isMounted && eventData) {
          setEvent(eventData);
        }
        
        // Fetch registrations
        const regs = await getRegistrations(id);
        if (isMounted) {
          setRegistrations(regs);
        }
      } catch (error) {
        console.error('Error loading event data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadEventData();
    
    // Subscribe to real-time updates
    const setupRealtimeSubscription = () => {
      if (!id) return;
      
      console.log('Setting up real-time subscription for event:', id);
      
      const channel = supabase
        .channel(`event-registrations-${id}`)
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'event_registrations', filter: `event_id=eq.${id}` },
            async (payload) => {
              console.log('Registration change detected:', payload);
              if (isMounted) {
                // Refresh event data
                const updatedEvent = await getEventById(id);
                if (updatedEvent) setEvent(updatedEvent);
                
                // Refresh registrations
                const updatedRegs = await getRegistrations(id);
                setRegistrations(updatedRegs);
              }
            }
        )
        .subscribe();
      
      // Store the channel reference for cleanup
      channelRef.current = channel;
    };
    
    setupRealtimeSubscription();
    
    return () => {
      isMounted = false;
      
      // Clean up real-time subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [id]);
  
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
            <EventRegistrationManager 
              eventId={id} 
              event={event} 
              registrations={registrations} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default EventRegistrationsPage;
