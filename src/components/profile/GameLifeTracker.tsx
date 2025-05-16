
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { getDeckById } from '@/services/ProfileService';
import LifeCounter from './game/LifeCounter';
import LifeHistory from './game/LifeHistory';
import SideboardGuideComponent from './SideboardGuide';
import { History, RefreshCw, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LifeChange {
  player: 'player' | 'opponent';
  amount: number;
  type: 'fetch' | 'creature' | 'spell' | 'gain' | 'generic';
  timestamp: string;
  lifeAfterChange: number;
}

interface GameLifeTrackerProps {
  deckId: string;
  onGameEnd: () => void;
}

const GameLifeTracker: React.FC<GameLifeTrackerProps> = ({ deckId, onGameEnd }) => {
  const [playerLife, setPlayerLife] = useState(20);
  const [opponentLife, setOpponentLife] = useState(20);
  const [lifeHistory, setLifeHistory] = useState<LifeChange[]>([]);
  const isMobile = useIsMobile();
  
  const isQuickAccess = deckId === "quickaccess";

  // Only fetch deck data if it's not quickaccess mode
  const { data: deck } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => isQuickAccess ? null : getDeckById(deckId),
    enabled: !isQuickAccess
  });

  const updateLife = (player: 'player' | 'opponent', amount: number, type: 'fetch' | 'creature' | 'spell' | 'gain' | 'generic') => {
    let newLife: number;
    
    if (player === 'player') {
      newLife = playerLife + amount;
      setPlayerLife(newLife);
    } else {
      newLife = opponentLife + amount;
      setOpponentLife(newLife);
    }
    
    const change: LifeChange = {
      player,
      amount,
      type,
      timestamp: new Date().toLocaleTimeString(),
      lifeAfterChange: newLife
    };
    
    setLifeHistory(prev => [...prev, change]);
  };

  const resetGame = () => {
    setPlayerLife(20);
    setOpponentLife(20);
    setLifeHistory([]);
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
      <LifeCounter 
        life={opponentLife}
        player="opponent"
        onDamage={updateLife}
      />

      <div className="flex justify-center my-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Game Options
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>Game Options</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full flex justify-between">
                    <span>Life History</span>
                    <History className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="h-[70vh] sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Life History</DialogTitle>
                  </DialogHeader>
                  <div className="h-full overflow-hidden">
                    <LifeHistory history={lifeHistory} />
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full flex justify-between">
                    <span>Reset Game</span>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Game</DialogTitle>
                  </DialogHeader>
                  <p>Are you sure you want to reset the game? This will set both life totals back to 20 and clear the history.</p>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      variant="destructive"
                      onClick={resetGame}
                    >
                      Reset
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {!isQuickAccess && deck?.sideboardGuide && (
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Sideboard Guide
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Guía de Sideboard</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                      <SideboardGuideComponent
                        deckId={deckId}
                        initialGuide={deck.sideboardGuide}
                        onSave={() => {}} // Read-only mode during game
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
              )}

              <Button 
                variant="default"
                onClick={onGameEnd}
              >
                End Game
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <LifeCounter 
        life={playerLife}
        player="player"
        onDamage={updateLife}
      />
    </div>
  );
};

export default GameLifeTracker;
