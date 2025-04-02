
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import EventDetail from '@/components/EventDetail';
import { useEvents } from '@/context/EventContext';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getEventById, isLoading } = useEvents();
  const navigate = useNavigate();
  
  const event = id ? getEventById(id) : undefined;
  
  const goBack = () => {
    navigate(-1);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center h-40">
              <p>Loading event details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button 
              variant="ghost" 
              className="mb-6" 
              onClick={goBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex justify-center items-center h-40">
              <p>Event not found</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          
          <EventDetail event={event} />
        </div>
      </main>
    </div>
  );
};

export default EventDetailPage;
