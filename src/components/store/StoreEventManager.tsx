
import { useState, useEffect, useRef } from 'react';
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
  const { events, deleteEvent, refreshEvents, showToastOnce } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storeEvents, setStoreEvents] = useState<Event[]>([]);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const initialLoadDoneRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  
  // Handle safe refresh to prevent loops
  const safeRefresh = async () => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    try {
      await refreshEvents();
    } finally {
      isRefreshingRef.current = false;
    }
  };

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
    // Only refresh events once when component mounts
    if (!initialLoadDoneRef.current) {
      console.log('StoreEventManager: Initial events refresh');
      initialLoadDoneRef.current = true;
      safeRefresh();
    }
  }, []);

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
      if (showToastOnce) {
        showToastOnce('Event deleted successfully', 'success');
      } else {
        toast.success('Event deleted successfully');
      }
      setEventToDelete(null);
    } catch (error) {
      if (showToastOnce) {
        showToastOnce('Failed to delete event', 'error');
      } else {
        toast.error('Failed to delete event');
      }
      console.error('Delete error:', error);
    }
  };

  const handleViewRegistrations = (eventId: string) => {
    navigate(`/events/${eventId}/registrations`);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">My Events</h2>
          <p className="text-muted-foreground">
            {user.role === 'admin' ? 'Manage all events' : 'Manage your events'}
          </p>
        </div>
        <Button onClick={handleCreateEvent} className="whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" />
          Create New Event
        </Button>
      </div>

      <Separator />

      {storeEvents.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <h3 className="font-semibold text-xl mb-2">No Events Found</h3>
          <p className="text-muted-foreground mb-6 px-4">
            {user.role === 'admin'
              ? 'There are no events in the system yet.'
              : 'You have not created any events yet.'}
          </p>
          <Button onClick={handleCreateEvent}>Create Your First Event</Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1">
          {storeEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/50">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                  <Badge variant={event.featured ? 'default' : 'outline'} className="ml-2 whitespace-nowrap">
                    {event.format}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.startDate)}
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {event.currentParticipants ?? 0} / {event.maxParticipants ?? '∞'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewRegistrations(event.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Registrations
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditEvent(event.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <PencilLine className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => confirmDeleteEvent(event)}
                      className="flex-1 sm:flex-none"
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
        <AlertDialogContent className="max-w-[95vw] w-full sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-2 sm:mt-0">Cancel</AlertDialogCancel>
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
