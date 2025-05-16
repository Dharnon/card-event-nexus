
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Skull, Zap, Plus, Minus } from 'lucide-react';

interface DamageButtonsProps {
  player: 'player' | 'opponent';
  onDamage: (player: 'player' | 'opponent', amount: number, type: 'fetch' | 'creature' | 'spell' | 'gain' | 'generic') => void;
}

const DamageButtons = ({ player, onDamage }: DamageButtonsProps) => {
  const isOpponent = player === 'opponent';

  return (
    <div className={`grid grid-cols-3 gap-2 w-full ${isOpponent ? 'transform rotate-180' : ''}`}>
      {/* Generic damage/gain buttons */}
      <div className="col-span-3 flex gap-2 mb-2">
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -1, 'generic')}
          className="h-10 flex-1 text-base bg-red-500/10 hover:bg-red-500/20"
          size="sm"
        >
          <Minus className="h-4 w-4 mr-1" />
          -1
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDamage(player, 1, 'generic')}
          className="h-10 flex-1 text-base bg-green-500/10 hover:bg-green-500/20"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          +1
        </Button>
      </div>

      {/* Damage buttons column 1 */}
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -1, 'fetch')}
          className="h-12 text-sm"
          size="sm"
        >
          <Minus className="h-4 w-4 mr-1" />
          -1
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -3, 'fetch')}
          className="h-12 text-sm"
          size="sm"
        >
          <Minus className="h-4 w-4 mr-1" />
          -3
        </Button>
      </div>

      {/* Damage buttons column 2 */}
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -2, 'creature')}
          className="h-12 text-sm"
          size="sm"
        >
          <Skull className="h-4 w-4 mr-1" />
          -2
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -3, 'creature')}
          className="h-12 text-sm"
          size="sm"
        >
          <Skull className="h-4 w-4 mr-1" />
          -3
        </Button>
      </div>

      {/* Damage buttons column 3 */}
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -2, 'spell')}
          className="h-12 text-sm"
          size="sm"
        >
          <Zap className="h-4 w-4 mr-1" />
          -2
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDamage(player, -3, 'spell')}
          className="h-12 text-sm"
          size="sm"
        >
          <Zap className="h-4 w-4 mr-1" />
          -3
        </Button>
      </div>

      {/* Life gain buttons row */}
      <div className="col-span-3 grid grid-cols-2 gap-2">
        <Button 
          variant="outline"
          onClick={() => onDamage(player, 3, 'gain')}
          className="h-12 text-sm bg-green-500/10 hover:bg-green-500/20"
          size="sm"
        >
          <Heart className="h-4 w-4 mr-1 text-green-500" />
          +3
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDamage(player, 4, 'gain')}
          className="h-12 text-sm bg-green-500/10 hover:bg-green-500/20"
          size="sm"
        >
          <Heart className="h-4 w-4 mr-1 text-green-500" />
          +4
        </Button>
      </div>
    </div>
  );
};

export default DamageButtons;
