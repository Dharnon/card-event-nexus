
import { useNavigate } from 'react-router-dom';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/context/EventContext';
import EventFilters from '@/components/EventFilters';
import { useEventFilters } from '@/hooks/useEventFilters';
import { PlusCircle, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const EventsPage = () => {
  const { events, isLoading } = useEvents();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Browse upcoming Magic: The Gathering events
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline"
            onClick={() => navigate('/calendar')}
            className="flex-1 sm:flex-auto"
          >
            <Calendar size={18} className="mr-2" />
            Calendar View
          </Button>
          <Button 
            onClick={handleCreateEvent}
            className="flex-1 sm:flex-auto"
          >
            <PlusCircle size={18} className="mr-2" />
            Create Event
          </Button>
        </div>
      </div>
      
      {isMobile ? (
        <>
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
        </>
      ) : (
        <div className="flex flex-row gap-6">
          {/* Filters Column - Left */}
          <div className="w-1/4 min-w-[250px]">
            <EventFilters
              activeFormat={activeFormat}
              setActiveFormat={setActiveFormat}
              activeType={activeType}
              setActiveType={setActiveType}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          </div>
          
          {/* Events Column - Right */}
          <div className="flex-1">
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
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EventsPage;
