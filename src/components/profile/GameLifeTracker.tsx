
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LifeChange {
  player: 'player' | 'opponent';
  amount: number;
  timestamp: string;
}

interface GameLifeTrackerProps {
  deckId: string;
  onGameEnd: () => void;
}

const GameLifeTracker: React.FC<GameLifeTrackerProps> = ({ deckId, onGameEnd }) => {
  const [playerLife, setPlayerLife] = useState(20);
  const [opponentLife, setOpponentLife] = useState(20);
  const [lifeHistory, setLifeHistory] = useState<LifeChange[]>([]);
  const [showSideboard, setShowSideboard] = useState(false);
  const isMobile = useIsMobile();

  const updateLife = (player: 'player' | 'opponent', amount: number) => {
    const change: LifeChange = {
      player,
      amount,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setLifeHistory(prev => [...prev, change]);
    
    if (player === 'player') {
      setPlayerLife(prev => prev + amount);
    } else {
      setOpponentLife(prev => prev + amount);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-md mx-auto">
      {/* Opponent's life counter - at the top, rotated for them */}
      <Card className="glass-morphism mb-4 transform rotate-180">
        <CardContent className="p-4">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold mb-4 transform rotate-180">
              {opponentLife}
            </span>
            <div className="flex justify-center gap-4 w-full transform rotate-180">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => updateLife('opponent', -1)}
                className="h-16 w-16 text-xl"
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => updateLife('opponent', +1)}
                className="h-16 w-16 text-xl"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 w-full transform rotate-180">
              <Button 
                variant="outline"
                onClick={() => updateLife('opponent', -5)}
                className="text-lg"
              >
                -5
              </Button>
              <Button 
                variant="outline"
                onClick={() => updateLife('opponent', +5)}
                className="text-lg"
              >
                +5
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Life history in the middle */}
      <Card className="glass-morphism flex-grow mb-4 overflow-hidden">
        <CardContent className="p-4 h-full">
          <ScrollArea className="h-full w-full rounded-md">
            {lifeHistory.map((change, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between py-2 px-4 ${
                  index % 2 === 0 ? 'bg-background/5' : ''
                }`}
              >
                <span className="text-sm">
                  {change.timestamp} - 
                  {change.player === 'player' ? 'Tú' : 'Oponente'}:
                  {change.amount > 0 ? '+' : ''}{change.amount}
                </span>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Player's life counter - at the bottom */}
      <Card className="glass-morphism mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold mb-4">
              {playerLife}
            </span>
            <div className="flex justify-center gap-4 w-full">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => updateLife('player', -1)}
                className="h-16 w-16 text-xl"
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => updateLife('player', +1)}
                className="h-16 w-16 text-xl"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 w-full">
              <Button 
                variant="outline"
                onClick={() => updateLife('player', -5)}
                className="text-lg"
              >
                -5
              </Button>
              <Button 
                variant="outline"
                onClick={() => updateLife('player', +5)}
                className="text-lg"
              >
                +5
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control buttons at the bottom */}
      <div className="flex justify-between gap-4 mb-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => setShowSideboard(!showSideboard)}
        >
          Sideboard
        </Button>
        <Button 
          variant="default"
          className="flex-1"
          onClick={onGameEnd}
        >
          Finalizar
        </Button>
      </div>
    </div>
  );
};

export default GameLifeTracker;
