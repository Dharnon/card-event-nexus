
import { useState } from 'react';
import { Calendar, Grid3X3, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import EventFilters from '@/components/EventFilters';
import { useEvents } from '@/context/EventContext';

const EventsPage = () => {
  const { filteredEvents, isLoading } = useEvents();
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Browse Events</h1>
              <p className="text-muted-foreground">
                Find and register for upcoming Magic: The Gathering events
              </p>
            </div>
            <div className="mt-4 md:mt-0 space-x-2">
              <Button 
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Hide Filters
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </>
                )}
              </Button>
              <Button variant="outline" className="md:inline-flex hidden">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid View
              </Button>
              <Button variant="outline" className="md:inline-flex hidden">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className={`md:w-[300px] md:block ${showFilters ? 'block' : 'hidden'}`}>
              <div className="sticky top-6 w-full">
                <EventFilters />
              </div>
            </div>
            
            <div className="flex-1">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading events...</p>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-lg border shadow-sm">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search for different events
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Adjust Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventsPage;
