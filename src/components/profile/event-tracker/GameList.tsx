
import { GameResult, Deck } from '@/types';
import { Trophy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameListProps {
  games: GameResult[];
  decks: Deck[];
  onAddGame: () => void;
}

const GameList = ({ games, decks, onAddGame }: GameListProps) => {
  const isMobile = useIsMobile();
  
  // Format match score for display
  const formatMatchScore = (game: GameResult) => {
    if (!game.matchScore) return game.win ? 'Victoria' : 'Derrota';
    
    const { playerWins, opponentWins } = game.matchScore;
    return `${playerWins}-${opponentWins}`;
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/30">
        <p className="text-muted-foreground mb-4">Aún no hay partidas en este evento</p>
        <button 
          onClick={onAddGame}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
        >
          Añadir primera partida
        </button>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Partidas</h3>
        
        <div className="space-y-2">
          {games.map((game) => {
            const deckName = decks?.find(d => d.id === game.deckUsed)?.name || game.deckUsed;
            const isWin = game.win;
            const scoreDisplay = formatMatchScore(game);
            
            return (
              <div key={game.id} className="border-t border-zinc-800 pt-2">
                <div className="flex justify-between items-center mb-1">
                  <div className={`rounded-md px-3 py-1 text-sm font-medium inline-flex items-center ${
                    isWin ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                  }`}>
                    {isWin ? 'Victoria' : 'Derrota'}
                    <span className="ml-1 text-xs">
                      {scoreDisplay}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-400">{game.opponentDeckName}</div>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <div>
                    {deckName || '-'}
                  </div>
                  <div className="truncate max-w-[50%] text-right">
                    {game.notes || '-'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Partidas</h3>
      
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Resultado</th>
              <th className="text-left p-3">Oponente</th>
              <th className="text-left p-3">Mazo utilizado</th>
              <th className="text-left p-3">Notas</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} className="border-t">
                <td className="p-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    game.win ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {game.win ? 'Victoria' : 'Derrota'}{' '}
                    {game.matchScore && (
                      <span className="ml-1 flex items-center">
                        <Trophy className="h-3 w-3 mr-1" /> 
                        {formatMatchScore(game)}
                      </span>
                    )}
                  </span>
                </td>
                <td className="p-3">{game.opponentDeckName}</td>
                <td className="p-3">
                  {decks?.find(d => d.id === game.deckUsed)?.name || game.deckUsed}
                </td>
                <td className="p-3">{game.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameList;
