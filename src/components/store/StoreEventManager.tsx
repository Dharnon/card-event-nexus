
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { Plus, PencilLine, Trash2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
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
import { toast } from "sonner";

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MM/dd/yyyy • h:mm a');
};

const StoreEventManager = () => {
  const { events, deleteEvent, refreshEvents } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storeEvents, setStoreEvents] = useState<Event[]>([]);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  useEffect(() => {
    if (user) {
      // Filter events for this store (or all events for admin)
      const filteredEvents = user.role === 'admin' 
        ? events
        : events.filter(event => event.createdBy === user.id);
      setStoreEvents(filteredEvents);
    }
  }, [events, user]);

  useEffect(() => {
    // Refresh events when component mounts
    refreshEvents();
  }, [refreshEvents]);

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/events/edit/${eventId}`);
  };

  const confirmDeleteEvent = (event: Event) => {
    setEventToDelete(event);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteEvent(eventToDelete.id);
      toast.success('Event deleted successfully');
      setEventToDelete(null);
    } catch (error) {
      toast.error('Failed to delete event');
      console.error('Delete error:', error);
    }
  };

  const handleViewRegistrations = (eventId: string) => {
    navigate(`/events/${eventId}/registrations`);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Events</h2>
          <p className="text-muted-foreground">
            {user.role === 'admin' ? 'Manage all events' : 'Manage your events'}
          </p>
        </div>
        <Button onClick={handleCreateEvent}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Event
        </Button>
      </div>

      <Separator />

      {storeEvents.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="font-semibold text-xl mb-2">No Events Found</h3>
          <p className="text-muted-foreground mb-6">
            {user.role === 'admin'
              ? 'There are no events in the system yet.'
              : 'You have not created any events yet.'}
          </p>
          <Button onClick={handleCreateEvent}>Create Your First Event</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {storeEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/50">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge variant={event.featured ? 'default' : 'outline'}>
                    {event.format}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.startDate)}
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {event.currentParticipants ?? 0} / {event.maxParticipants ?? '∞'}
                      </span>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewRegistrations(event.id)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Registrations
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditEvent(event.id)}
                    >
                      <PencilLine className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => confirmDeleteEvent(event)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StoreEventManager;
