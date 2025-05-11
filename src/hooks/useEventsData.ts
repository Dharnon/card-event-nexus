
import { useState, useEffect, useRef } from 'react';
import { Event } from '@/types';
import { getEvents, subscribeToEvents } from '@/services/EventService';
import { toast } from 'sonner';

export const useEventsData = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const toastShownRef = useRef<{[key: string]: boolean}>({});
  const toastTimeouts = useRef<{[key: string]: NodeJS.Timeout}>({});
  const isSubscribedRef = useRef<boolean>(false);
  const loadingInProgressRef = useRef<boolean>(false);

  const showToastOnce = (message: string, type: 'success' | 'error') => {
    const toastKey = `${type}-${message}`;
    
    // Only show toast if we haven't shown this one recently (within last 2s)
    if (!toastShownRef.current[toastKey]) {
      toastShownRef.current[toastKey] = true;
      
      // Clear any existing timeout for this toast key
      if (toastTimeouts.current[toastKey]) {
        clearTimeout(toastTimeouts.current[toastKey]);
      }
      
      if (type === 'error') {
        toast.error(message);
      } else {
        toast.success(message);
      }
      
      // Clear this toast notification after a delay
      toastTimeouts.current[toastKey] = setTimeout(() => {
        delete toastShownRef.current[toastKey];
        delete toastTimeouts.current[toastKey];
      }, 2000);
    }
  };

  const loadEvents = async () => {
    // Prevent concurrent loading operations
    if (loadingInProgressRef.current) {
      console.log('Events loading already in progress, skipping...');
      return events;
    }
    
    try {
      loadingInProgressRef.current = true;
      setLoading(true);
      const eventsData = await getEvents();
      console.log('Loaded events:', eventsData);
      setEvents(eventsData);
      setError(null);
      return eventsData;
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err);
      showToastOnce('Failed to load events. Please try again later.', 'error');
      return [];
    } finally {
      loadingInProgressRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Only set up subscription if we haven't already
    if (!isSubscribedRef.current) {
      isSubscribedRef.current = true;
      console.log('Setting up event subscription...');
      
      // Subscribe to event updates with debounce to prevent multiple quick updates
      const unsubscribe = subscribeToEvents(updatedEvents => {
        console.log('Events updated via subscription:', updatedEvents);
        setEvents(updatedEvents);
      });
      
      // Clean up function
      return () => {
        console.log('Cleaning up event subscription...');
        // Clean up timeouts
        Object.values(toastTimeouts.current).forEach(timeout => clearTimeout(timeout));
        unsubscribe();
        isSubscribedRef.current = false;
      };
    }
    
    return () => {
      // Clean up timeouts when the component unmounts even if no subscription was made
      Object.values(toastTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    events,
    setEvents,
    loading,
    error,
    refreshEvents: loadEvents,
    showToastOnce
  };
};
