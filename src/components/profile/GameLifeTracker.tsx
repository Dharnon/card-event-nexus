
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="magic-card">
        <CardHeader>
          <CardTitle>Tú ({playerLife})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => updateLife('player', -1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => updateLife('player', +1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => updateLife('player', -5)}
            >
              -5
            </Button>
            <Button 
              variant="outline" 
              onClick={() => updateLife('player', +5)}
            >
              +5
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="magic-card">
        <CardHeader>
          <CardTitle>Oponente ({opponentLife})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => updateLife('opponent', -1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => updateLife('opponent', +1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => updateLife('opponent', -5)}
            >
              -5
            </Button>
            <Button 
              variant="outline" 
              onClick={() => updateLife('opponent', +5)}
            >
              +5
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 magic-card">
        <CardHeader>
          <CardTitle>Historial de Vida</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {lifeHistory.map((change, index) => (
              <div key={index} className="flex items-center justify-between py-1">
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
      
      <div className="col-span-1 md:col-span-2 flex justify-center gap-4">
        <Button onClick={() => setShowSideboard(!showSideboard)}>
          Ver Guía de Sideboard
        </Button>
        <Button variant="outline" onClick={onGameEnd}>
          Finalizar Partida
        </Button>
      </div>
    </div>
  );
};

export default GameLifeTracker;
