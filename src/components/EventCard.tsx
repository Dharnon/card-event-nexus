
import * as dateFns from 'date-fns';
import { CalendarClock, MapPin, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Event, EventFormat } from '@/types';

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
  'Tournament': 'bg-magic-purple/10 text-magic-purple border-magic-purple/30',
  'Casual Play': 'bg-green-100 text-green-700',
  'Championship': 'bg-red-100 text-red-700',
  'League': 'bg-blue-100 text-blue-700',
  'Special Event': 'bg-amber-100 text-amber-700'
};

interface EventCardProps {
  event: Event;
  className?: string;
}

const EventCard = ({ event, className = '' }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    return dateFns.format(dateFns.parseISO(dateString), 'MMM d, yyyy • h:mm a');
  };

  return (
    <Link to={`/events/${event.id}`}>
      <Card className={`magic-card magic-card-hover h-full ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className={typeColors[event.type] || ''}>
              {event.type}
            </Badge>
            <Badge variant="outline" className={formatColors[event.format] || ''}>
              {event.format}
            </Badge>
          </div>
          <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2">{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <CalendarClock className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <span className="line-clamp-1">{event.location.name}, {event.location.city}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>
                {event.currentParticipants ?? 0}/{event.maxParticipants ?? '∞'}
              </span>
            </div>
            {event.price && event.price > 0 && (
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                <span>{event.price}€</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default EventCard;
