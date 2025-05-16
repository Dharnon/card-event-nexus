
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Heart, Skull, Zap, Plus, Minus } from 'lucide-react';

interface DamageButtonsProps {
  player: 'player' | 'opponent';
  onDamage: (player: 'player' | 'opponent', amount: number, type: 'fetch' | 'creature' | 'spell' | 'gain' | 'generic') => void;
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
      <Button 
        variant="outline"
        onClick={() => onDamage(player, -1, 'generic')}
        className="h-12"
      >
        <Minus className="h-4 w-4 mr-1" />
        -1
      </Button>
      <div className="flex flex-col gap-2 col-span-1">
        <Button 
          variant="outline"
          onClick={() => onDamage(player, 3, 'gain')}
          className="h-12"
        >
          <Heart className="h-4 w-4 mr-1" />
          +3
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDamage(player, 4, 'gain')}
          className="h-12"
        >
          <Heart className="h-4 w-4 mr-1" />
          +4
        </Button>
      </div>
      <Button 
        variant="outline"
        onClick={() => onDamage(player, 1, 'generic')}
        className="h-12"
      >
        <Plus className="h-4 w-4 mr-1" />
        +1
      </Button>
    </div>
  );
};

export default DamageButtons;
