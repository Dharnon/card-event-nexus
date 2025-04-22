
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useQuery } from '@tanstack/react-query';
import { getDeckById } from '@/services/ProfileService';
import LifeCounter from './game/LifeCounter';
import LifeHistory from './game/LifeHistory';
import SideboardGuideComponent from './SideboardGuide';

interface LifeChange {
  player: 'player' | 'opponent';
  amount: number;
  type: 'fetch' | 'creature' | 'spell';
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

  const { data: deck } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => getDeckById(deckId),
  });

  const updateLife = (player: 'player' | 'opponent', amount: number, type: 'fetch' | 'creature' | 'spell') => {
    const change: LifeChange = {
      player,
      amount,
      type,
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
      <LifeCounter 
        life={opponentLife}
        player="opponent"
        onDamage={updateLife}
      />

      <Card className="glass-morphism flex-grow mb-4 overflow-hidden">
        <CardContent className="p-4 h-full">
          <LifeHistory history={lifeHistory} />
        </CardContent>
      </Card>

      <LifeCounter 
        life={playerLife}
        player="player"
        onDamage={updateLife}
      />

      <div className="flex justify-between gap-4 mb-4">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex-1">
              Sideboard
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Guía de Sideboard</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              {deck?.sideboardGuide ? (
                <SideboardGuideComponent
                  deckId={deckId}
                  initialGuide={deck.sideboardGuide}
                  onSave={() => {}} // Read-only mode during game
                />
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Este mazo no tiene guía de sideboard
                </p>
              )}
            </div>
          </DrawerContent>
        </Drawer>
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
