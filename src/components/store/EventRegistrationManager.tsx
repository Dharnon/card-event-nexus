
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  userEmail?: string;
  userName?: string;
}

const EventRegistrationManager = () => {
  const { id } = useParams<{ id: string }>();
  const { getEventById } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(id ? getEventById(id) : null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToRemove, setUserToRemove] = useState<Registration | null>(null);
  const [userToAdd, setUserToAdd] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        
        // Fetch registrations for this event
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('event_id', id);
          
        if (registrationsError) throw registrationsError;
        
        // Get user details for each registration
        const userIds = registrationsData.map(reg => reg.user_id);
        
        // We can't directly query auth.users, so we'll use public.profiles if available
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
          
        // Get user emails from auth.users (only works if you're admin/server-side)
        // This is a simplified approach - in practice, store user emails in profiles table 
        // or use a server-side function to get this data
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        const userEmails = authError ? {} : 
          Object.fromEntries((authData?.users || []).map(u => [u.id, u.email]));
        
        // Map the registrations with user details
        const enhancedRegistrations = registrationsData.map(reg => {
          const profile = profilesData?.find(p => p.id === reg.user_id);
          return {
            id: reg.id,
            userId: reg.user_id,
            eventId: reg.event_id,
            registeredAt: reg.registered_at,
            userName: profile?.username || 'Unknown User',
            userEmail: userEmails[reg.user_id] || 'email@example.com'
          };
        });
        
        setRegistrations(enhancedRegistrations);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        toast.error('Could not load registrations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegistrations();
  }, [id]);

  // Check if user is authorized to view this page
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!event) {
      toast.error('Event not found');
      navigate('/');
      return;
    }
    
    // Only store owner or admin can access this page
    if (user.role !== 'admin' && event.createdBy !== user.id) {
      toast.error('You do not have permission to manage this event');
      navigate('/');
    }
  }, [event, user, navigate]);
  
  const handleRemoveUser = async () => {
    if (!userToRemove || !event) return;
    
    try {
      // Remove user from event
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('user_id', userToRemove.userId)
        .eq('event_id', event.id);
        
      if (error) throw error;
      
      toast.success('User removed from event');
      // Update local state
      setRegistrations(prev => prev.filter(reg => reg.userId !== userToRemove.userId));
      setUserToRemove(null);
      
      // Update event participant count in UI
      if (event.currentParticipants !== undefined) {
        setEvent({
          ...event,
          currentParticipants: Math.max(0, event.currentParticipants - 1)
        });
      }
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    }
  };
  
  const handleAddUser = async () => {
    if (!userToAdd || !event) return;
    
    try {
      // Try to find user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', userToAdd)
        .single();
        
      if (userError) {
        toast.error('User not found');
        return;
      }
      
      // Check if user is already registered
      const { data: existingReg } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', userData.id)
        .eq('event_id', event.id)
        .maybeSingle();
        
      if (existingReg) {
        toast.error('User already registered for this event');
        return;
      }
      
      // Add user to event
      const { error: regError } = await supabase
        .from('event_registrations')
        .insert({
          user_id: userData.id,
          event_id: event.id
        });
        
      if (regError) throw regError;
      
      // Refresh registrations
      const { data: newReg } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', userData.id)
        .eq('event_id', event.id)
        .single();
        
      if (newReg) {
        const newRegistration = {
          id: newReg.id,
          userId: newReg.user_id,
          eventId: newReg.event_id,
          registeredAt: newReg.registered_at,
          userName: userToAdd,
          userEmail: 'email@example.com' // This would ideally come from the database
        };
        
        setRegistrations(prev => [...prev, newRegistration]);
        
        // Update event participant count in UI
        if (event.currentParticipants !== undefined) {
          setEvent({
            ...event,
            currentParticipants: event.currentParticipants + 1
          });
        }
      }
      
      toast.success('User added to event');
      setUserToAdd('');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    }
  };
  
  const goBack = () => navigate(-1);
  
  if (loading || !event) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading event registrations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={goBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to Event</DialogTitle>
              <DialogDescription>
                Enter the username of the user you want to add to this event.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Input
                placeholder="Username"
                value={userToAdd}
                onChange={(e) => setUserToAdd(e.target.value)}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">Event Registrations</h1>
        <h2 className="text-xl mt-1">{event.title}</h2>
        <p className="text-muted-foreground">
          {event.currentParticipants ?? 0} 
          {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants
        </p>
      </div>
      
      <Separator />
      
      {registrations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="font-semibold text-xl mb-2">No Registrations Yet</h3>
          <p className="text-muted-foreground mb-6">
            There are no users registered for this event yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <Card key={registration.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">{registration.userName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{registration.userEmail}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-500"
                    onClick={() => setUserToRemove(registration)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToRemove?.userName} from this event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveUser}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventRegistrationManager;
