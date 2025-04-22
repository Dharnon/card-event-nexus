
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, Skull, Zap } from 'lucide-react';

interface DamageButtonsProps {
  player: 'player' | 'opponent';
  onDamage: (player: 'player' | 'opponent', amount: number, type: 'fetch' | 'creature' | 'spell') => void;
}

const DamageButtons = ({ player, onDamage }: DamageButtonsProps) => {
  const isOpponent = player === 'opponent';

  return (
    <div className={`grid grid-cols-3 gap-2 w-full ${isOpponent ? 'transform rotate-180' : ''}`}>
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -1, 'fetch')}
          className="h-12"
        >
          <ArrowDown className="h-4 w-4 mr-1" />
          Fetch -1
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -3, 'fetch')}
          className="h-12"
        >
          <ArrowDown className="h-4 w-4 mr-1" />
          Fetch -3
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -2, 'creature')}
          className="h-12"
        >
          <Skull className="h-4 w-4 mr-1" />
          -2
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -3, 'creature')}
          className="h-12"
        >
          <Skull className="h-4 w-4 mr-1" />
          -3
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -2, 'spell')}
          className="h-12"
        >
          <Zap className="h-4 w-4 mr-1" />
          -2
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -3, 'spell')}
          className="h-12"
        >
          <Zap className="h-4 w-4 mr-1" />
          -3
        </Button>
      </div>
    </div>
  );
};

export default DamageButtons;
