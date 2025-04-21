import * as dateFns from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CalendarClock, 
  MapPin, 
  Users, 
  CreditCard, 
  Clock, 
  Store as StoreIcon, 
  Calendar, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Event, EventFormat, EventType } from '@/types';

interface EventDetailProps {
  event: Event;
}

const formatColors: Record<EventFormat, string> = {
  'Standard': 'bg-blue-100 text-blue-700',
  'Modern': 'bg-purple-100 text-purple-700',
  'Legacy': 'bg-amber-100 text-amber-700',
  'Commander': 'bg-green-100 text-green-700',
  'Pioneer': 'bg-red-100 text-red-700',
  'Vintage': 'bg-gray-100 text-gray-700',
  'Draft': 'bg-indigo-100 text-indigo-700',
  'Sealed': 'bg-emerald-100 text-emerald-700',
  'Prerelease': 'bg-yellow-100 text-yellow-700',
  'Other': 'bg-slate-100 text-slate-700'
};

const typeColors: Record<string, string> = {
  'tournament': 'bg-magic-purple/10 text-magic-purple border-magic-purple/30',
  'casual': 'bg-green-100 text-green-700',
  'championship': 'bg-red-100 text-red-700',
  'draft': 'bg-blue-100 text-blue-700',
  'prerelease': 'bg-amber-100 text-amber-700',
  'other': 'bg-slate-100 text-slate-700'
};

const typeLabels: Record<EventType, string> = {
  'tournament': 'Tournament',
  'casual': 'Casual Play',
  'championship': 'Championship',
  'draft': 'Draft',
  'prerelease': 'Prerelease',
  'other': 'Other'
};

const EventDetail = ({ event }: EventDetailProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const formatDate = (dateString: string) => {
    return dateFns.format(dateFns.parseISO(dateString), 'EEEE d MMMM, yyyy • h:mm a', { locale: es });
  };
  
  const formatTime = (dateString: string) => {
    return dateFns.format(dateFns.parseISO(dateString), 'h:mm a');
  };

  const handleRegister = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for this event",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Registration successful!",
      description: `You have been registered for ${event.title}`,
      variant: "default",
    });
  };
  
  const isFull = event.maxParticipants !== undefined && 
                event.currentParticipants !== undefined && 
                event.currentParticipants >= event.maxParticipants;
  
  return (
    <Card className="max-w-4xl mx-auto overflow-hidden">
      <div className="h-48 bg-magic-gradient-bg flex items-center justify-center">
        <Calendar className="h-24 w-24 text-white opacity-30" />
      </div>
      <CardHeader>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline" className={typeColors[event.type] || ''}>
            {typeLabels[event.type]}
          </Badge>
          <Badge variant="outline" className={formatColors[event.format] || ''}>
            {event.format}
          </Badge>
        </div>
        <CardTitle className="text-2xl">{event.title}</CardTitle>
        <CardDescription className="flex items-center mt-1">
          <StoreIcon className="h-4 w-4 mr-1" />
          Organized by Magic Store {event.location.city}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <CalendarClock className="h-5 w-5 mr-3 mt-0.5 text-magic-purple" />
              <div>
                <div className="font-medium">Date & Time</div>
                <div>{formatDate(event.startDate)}</div>
                {event.endDate && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Until {formatTime(event.endDate)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 mt-0.5 text-magic-purple" />
              <div>
                <div className="font-medium">Location</div>
                <div>{event.location.name}</div>
                <div className="text-sm text-muted-foreground">
                  {event.location.address}, {event.location.city}
                  {event.location.postalCode && `, ${event.location.postalCode}`}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <Users className="h-5 w-5 mr-3 mt-0.5 text-magic-purple" />
              <div>
                <div className="font-medium">Participants</div>
                <div className="flex items-center">
                  {event.currentParticipants !== undefined && event.maxParticipants !== undefined ? (
                    <>
                      <span>{event.currentParticipants}/{event.maxParticipants}</span>
                      {isFull ? (
                        <Badge variant="outline" className="ml-2 bg-red-100 text-red-700 border-red-200">
                          Full
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-200">
                          Available
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span>Unlimited</span>
                  )}
                </div>
              </div>
            </div>
            {event.price !== undefined && (
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 mr-3 mt-0.5 text-magic-purple" />
                <div>
                  <div className="font-medium">Price</div>
                  <div>{event.price > 0 ? `${event.price}€` : 'Free'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Added on {dateFns.format(dateFns.parseISO(event.createdAt), 'PP')}</span>
          </div>
          
          {!isFull && (
            <Button onClick={handleRegister} className="px-8">
              Register
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventDetail;
