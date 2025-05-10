
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EventRegistrationManager from '@/components/store/EventRegistrationManager';

const EventRegistrationsPage = () => {
  const { id } = useParams<{ id: string }>();
  
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
