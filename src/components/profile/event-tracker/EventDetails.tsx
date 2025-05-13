
import { Button } from '@/components/ui/button';
import { UserEvent, GameResult, Deck } from '@/types';
import GameList from './GameList';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EventDetailsProps {
  selectedEvent: UserEvent;
  eventGames: GameResult[];
  decks: Deck[];
  onBack: () => void;
  onEdit: (event: UserEvent) => void;
  onDelete: (eventId: string) => void;
  onAddGame: () => void;
}

const EventDetails = ({
  selectedEvent,
  eventGames,
  decks,
  onBack,
  onEdit,
  onDelete,
  onAddGame
}: EventDetailsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-2 px-2"
        size={isMobile ? "sm" : "default"}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Volver a la lista
      </Button>
      
      {/* Event details card with dark theme for mobile */}
      <div className={`${isMobile ? 'bg-zinc-900 text-zinc-100 rounded-lg shadow-md' : 'bg-card'} p-4 rounded-lg shadow`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{selectedEvent.name}</h2>
            <p className={`${isMobile ? 'text-zinc-400' : 'text-muted-foreground'} text-sm`}>
              {new Date(selectedEvent.date).toLocaleDateString()}
            </p>
          </div>
          
          {isMobile ? (
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(selectedEvent)}
                className="h-8 w-8 p-0 rounded-full bg-purple-800/30 text-purple-400"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar evento</span>
              </Button>
              
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => onDelete(selectedEvent.id)}
                className="h-8 w-8 p-0 rounded-full bg-red-800/30 text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar evento</span>
              </Button>
            </div>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onEdit(selectedEvent)}>
                Editar evento
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => onDelete(selectedEvent.id)}
              >
                Eliminar evento
              </Button>
            </div>
          )}
        </div>
        
        {/* Add game button */}
        <Button 
          onClick={onAddGame}
          className={isMobile ? "w-full bg-purple-600 hover:bg-purple-700 mb-4" : "mb-4"}
        >
          Añadir partida
        </Button>
        
        {/* Games list */}
        <GameList 
          games={eventGames}
          decks={decks}
          onAddGame={onAddGame}
        />
      </div>
    </div>
  );
};

export default EventDetails;
