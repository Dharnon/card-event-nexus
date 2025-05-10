
import { Calendar, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserEvent } from '@/types';

interface EventListProps {
  events: UserEvent[];
  onAddEvent: () => void;
  onSelectEvent: (event: UserEvent) => void;
}

const EventList = ({ events, onAddEvent, onSelectEvent }: EventListProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Eventos</h2>
        <Button onClick={onAddEvent}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>
      
      {events.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Aún no tienes eventos creados</p>
          <Button onClick={onAddEvent}>
            Crear tu primer evento
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="magic-card magic-card-hover cursor-pointer"
              onClick={() => onSelectEvent(event)}
            >
              <div className="flex items-center p-4">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{event.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
