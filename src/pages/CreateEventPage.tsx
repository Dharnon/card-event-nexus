
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CreateEventForm from '@/components/CreateEventForm';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';

const CreateEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getEventById } = useEvents();
  const [event, setEvent] = useState(id ? getEventById(id) : undefined);
  const isEditing = !!id;
  
  // Only store accounts can access this page
  useEffect(() => {
    if (user && user.role !== 'store' && user.role !== 'admin') {
      navigate('/');
    }
    
    // If editing, check that the store owns this event or is admin
    if (isEditing && event && user && user.role === 'store' && event.createdBy !== user.id) {
      navigate('/');
    }
  }, [user, navigate, event, isEditing]);
  
  if (!user || (user.role !== 'store' && user.role !== 'admin')) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="flex items-center">
              {isEditing ? (
                <Edit className="h-6 w-6 text-magic-purple mr-2" />
              ) : (
                <Plus className="h-6 w-6 text-magic-purple mr-2" />
              )}
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Edit Event' : 'Create New Event'}
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {isEditing 
                ? 'Update the details of your Magic: The Gathering event'
                : 'Fill in the details to publish your Magic: The Gathering event'
              }
            </p>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <CreateEventForm eventId={id} initialEvent={event} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateEventPage;
