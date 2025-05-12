
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/context/EventContext';
import { Event } from '@/types';
import EventFilters from '@/components/EventFilters';
import { useEventFilters } from '@/hooks/useEventFilters';
import { PlusCircle } from 'lucide-react';

const EventsPage = () => {
  const { events, isLoading } = useEvents();
  const navigate = useNavigate();
  const { 
    filteredEvents, 
    activeFormat, 
    setActiveFormat,
    activeType,
    setActiveType,
    sortOrder,
    setSortOrder
  } = useEventFilters(events);
  
  const handleCreateEvent = () => {
    navigate('/events/create');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Events</h1>
              <p className="text-muted-foreground">
                Browse upcoming Magic: The Gathering events
              </p>
            </div>
            <Button 
              onClick={handleCreateEvent}
              className="mt-4 md:mt-0"
            >
              <PlusCircle size={18} className="mr-2" />
              Create Event
            </Button>
          </div>
          
          <EventFilters
            activeFormat={activeFormat}
            setActiveFormat={setActiveFormat}
            activeType={activeType}
            setActiveType={setActiveType}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
          
          {isLoading ? (
            <div className="text-center py-12">
              <p>Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="font-semibold text-xl mb-2">No Events Found</h3>
              <p className="text-muted-foreground mb-6">
                There are no events matching your filters.
              </p>
              <Button onClick={() => {
                setActiveFormat('all');
                setActiveType('all');
              }}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventsPage;
