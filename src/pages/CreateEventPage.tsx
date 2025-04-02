
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CreateEventForm from '@/components/CreateEventForm';
import { useAuth } from '@/context/AuthContext';

const CreateEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Only store accounts can access this page
  useEffect(() => {
    if (user && user.role !== 'store') {
      navigate('/');
    }
  }, [user, navigate]);
  
  if (!user || user.role !== 'store') {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="flex items-center">
              <Plus className="h-6 w-6 text-magic-purple mr-2" />
              <h1 className="text-3xl font-bold">Create New Event</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Fill in the details to publish your Magic: The Gathering event
            </p>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <CreateEventForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateEventPage;
