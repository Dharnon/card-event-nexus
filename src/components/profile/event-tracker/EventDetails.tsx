
import { Button } from '@/components/ui/button';
import { UserEvent, GameResult, Deck } from '@/types';
import GameList from './GameList';

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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver a la lista
        </Button>
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
      </div>
      
      <div className="magic-card p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{selectedEvent.name}</h2>
            <p className="text-muted-foreground">
              {new Date(selectedEvent.date).toLocaleDateString()}
            </p>
          </div>
          <Button onClick={onAddGame}>
            Añadir partida
          </Button>
        </div>
        
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
