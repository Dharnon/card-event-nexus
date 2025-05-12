
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { Plus, PencilLine, Trash2, Users, UserCheck } from 'lucide-react';
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MM/dd/yyyy • h:mm a');
};

interface EventRegistrationManagerProps {
  eventId?: string;
  event?: Event | null;
  registrations?: any[];
}

const EventRegistrationManager = ({ 
  eventId, 
  event: propEvent,
  registrations: propRegistrations = []
}: EventRegistrationManagerProps = {}) => {
  const params = useParams();
  const resolvedEventId = eventId || params.id;
  const { events, deleteEvent, refreshEvents, showToastOnce } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storeEvents, setStoreEvents] = useState<Event[]>([]);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<any[]>(propRegistrations);

  useEffect(() => {
    setRegistrations(propRegistrations);
  }, [propRegistrations]);

  useEffect(() => {
    // Use propEvent only if we're looking at a specific event
    if (resolvedEventId && propEvent) {
      setStoreEvents([propEvent]);
      return;
    }

    if (user) {
      // Filter events for this store (or all events for admin)
      const filteredEvents = user.role === 'admin' 
        ? events
        : events.filter(event => event.createdBy === user.id);
      setStoreEvents(filteredEvents);
    }
  }, [events, user, resolvedEventId, propEvent]);

  // Prevent duplicate toasts using the shared function from useEventsData
  const showToast = (message: string, type: 'success' | 'error') => {
    if (showToastOnce) {
      showToastOnce(message, type);
    } else {
      // Fallback if showToastOnce is not available
      if (type === 'error') {
        toast.error(message);
      } else {
        toast.success(message);
      }
    }
  };

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
      showToast('Event deleted successfully', 'success');
      setEventToDelete(null);
    } catch (error) {
      showToast('Failed to delete event', 'error');
      console.error('Delete error:', error);
    }
  };

  const handleViewRegistrations = (eventId: string) => {
    navigate(`/events/${eventId}/registrations`);
  };

  if (!user) return null;

  // Viewing a specific event's registrations
  if (resolvedEventId && propEvent) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Registrations for {propEvent.title}</h2>
            <p className="text-muted-foreground">
              {propEvent.currentParticipants || 0} / {propEvent.maxParticipants || '∞'} participants
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(`/events/${resolvedEventId}`)}>
              View Event
            </Button>
            <Button variant="outline" onClick={() => handleEditEvent(resolvedEventId)}>
              <PencilLine className="h-4 w-4 mr-1" />
              Edit Event
            </Button>
          </div>
        </div>

        <Separator />

        {registrations.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-xl mb-2">No Registrations Yet</h3>
            <p className="text-muted-foreground">
              When users register for this event, they will appear here.
            </p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registered Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Registered On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.user_id}</TableCell>
                        <TableCell>{formatDate(reg.registered_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Event list view (My Events page)
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {storeEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/50">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base md:text-lg line-clamp-1">{event.title}</CardTitle>
                  <Badge variant={event.featured ? 'default' : 'outline'} className="shrink-0">
                    {event.format}
                  </Badge>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {formatDate(event.startDate)}
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {event.currentParticipants ?? 0} / {event.maxParticipants ?? '∞'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 md:flex-none"
                      onClick={() => handleViewRegistrations(event.id)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Registrations
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 md:flex-none"
                      onClick={() => handleEditEvent(event.id)}
                    >
                      <PencilLine className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 md:flex-none"
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

export default EventRegistrationManager;
