import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowDown, ArrowUp, Skull, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import SideboardGuideComponent from './SideboardGuide';
import { useQuery } from '@tanstack/react-query';
import { getDeckById } from '@/services/ProfileService';

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
  const [showSideboard, setShowSideboard] = useState(false);
  const isMobile = useIsMobile();

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

  const DamageButtons = ({ player }: { player: 'player' | 'opponent' }) => {
    const isOpponent = player === 'opponent';
    return (
      <div className={`grid grid-cols-3 gap-2 w-full ${isOpponent ? 'transform rotate-180' : ''}`}>
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline"
            onClick={() => updateLife(player, -1, 'fetch')}
            className="h-12"
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            Fetch -1
          </Button>
          <Button 
            variant="outline"
            onClick={() => updateLife(player, -3, 'fetch')}
            className="h-12"
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            Fetch -3
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline"
            onClick={() => updateLife(player, -2, 'creature')}
            className="h-12"
          >
            <Skull className="h-4 w-4 mr-1" />
            -2
          </Button>
          <Button 
            variant="outline"
            onClick={() => updateLife(player, -3, 'creature')}
            className="h-12"
          >
            <Skull className="h-4 w-4 mr-1" />
            -3
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline"
            onClick={() => updateLife(player, -2, 'spell')}
            className="h-12"
          >
            <Zap className="h-4 w-4 mr-1" />
            -2
          </Button>
          <Button 
            variant="outline"
            onClick={() => updateLife(player, -3, 'spell')}
            className="h-12"
          >
            <Zap className="h-4 w-4 mr-1" />
            -3
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-md mx-auto">
      <Card className="glass-morphism mb-4 transform rotate-180">
        <CardContent className="p-4">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold mb-4 transform rotate-180">
              {opponentLife}
            </span>
            <DamageButtons player="opponent" />
          </div>
        </CardContent>
      </Card>

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
                  {change.timestamp} - {change.player === 'player' ? 'Tú' : 'Oponente'}:{' '}
                  {change.amount > 0 ? '+' : ''}{change.amount} ({change.type})
                </span>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="glass-morphism mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold mb-4">
              {playerLife}
            </span>
            <DamageButtons player="player" />
          </div>
        </CardContent>
      </Card>

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
