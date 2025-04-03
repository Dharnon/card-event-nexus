
import * as dateFns from 'date-fns';
import { CalendarClock, MapPin, Users, CreditCard, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Event, EventFormat } from '@/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const formatColors: Record<EventFormat, string> = {
  'Standard': 'bg-blue-900/50 text-blue-200 border-blue-700/50',
  'Modern': 'bg-purple-900/50 text-purple-200 border-purple-700/50',
  'Legacy': 'bg-amber-900/50 text-amber-200 border-amber-700/50',
  'Commander': 'bg-green-900/50 text-green-200 border-green-700/50',
  'Pioneer': 'bg-red-900/50 text-red-200 border-red-700/50',
  'Vintage': 'bg-gray-900/50 text-gray-200 border-gray-700/50',
  'Draft': 'bg-indigo-900/50 text-indigo-200 border-indigo-700/50',
  'Sealed': 'bg-emerald-900/50 text-emerald-200 border-emerald-700/50',
  'Prerelease': 'bg-yellow-900/50 text-yellow-200 border-yellow-700/50',
  'Other': 'bg-slate-900/50 text-slate-200 border-slate-700/50'
};

const typeColors: Record<string, string> = {
  'Tournament': 'bg-magic-purple/20 text-magic-lightPurple border-magic-purple/50',
  'Casual Play': 'bg-green-900/30 text-green-200 border-green-700/50',
  'Championship': 'bg-red-900/30 text-red-200 border-red-700/50',
  'League': 'bg-blue-900/30 text-blue-200 border-blue-700/50',
  'Special Event': 'bg-amber-900/30 text-amber-200 border-amber-700/50'
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
    <Link to={`/events/${event.id}`} className="block h-full">
      <Card className={`magic-card magic-card-hover shine-effect h-full ${className} border-border/50 glass-morphism`}>
        {event.image && (
          <AspectRatio ratio={16/9}>
            <img 
              src={event.image} 
              alt={event.title} 
              className="object-cover rounded-t-lg w-full"
            />
          </AspectRatio>
        )}
        <CardHeader className={`pb-2 relative ${event.image ? 'pt-3' : 'pt-4'}`}>
          {event.featured && (
            <div className="absolute -top-1 -right-1 z-10">
              <Badge variant="default" className="bg-amber-600 text-white shadow-lg">
                <Star className="h-3 w-3 mr-1 fill-current" /> Featured
              </Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className={typeColors[event.type] || ''}>
              {event.type}
            </Badge>
            <Badge variant="outline" className={formatColors[event.format] || ''}>
              {event.format}
            </Badge>
          </div>
          <CardTitle className="text-lg line-clamp-1 text-gradient font-bold">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-muted-foreground/90">{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <CalendarClock className="h-4 w-4 mr-2 mt-0.5 text-primary" />
              <span className="text-foreground/80">{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary" />
              <span className="line-clamp-1 text-foreground/80">{event.location.name}, {event.location.city}</span>
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
            {event.price !== undefined && event.price > 0 && (
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
