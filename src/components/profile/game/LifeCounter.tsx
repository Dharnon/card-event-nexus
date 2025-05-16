
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DamageButtons from './DamageButtons';

interface LifeCounterProps {
  life: number;
  player: 'player' | 'opponent';
  onDamage: (player: 'player' | 'opponent', amount: number, type: 'fetch' | 'creature' | 'spell' | 'gain' | 'generic') => void;
}

const LifeCounter = ({ life, player, onDamage }: LifeCounterProps) => {
  const isOpponent = player === 'opponent';

  return (
    <Card className={`glass-morphism flex-grow ${isOpponent ? 'transform rotate-180' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <span className={`text-5xl font-bold mb-4 ${isOpponent ? 'transform rotate-180' : ''}`}>
            {life}
          </span>
          <DamageButtons player={player} onDamage={onDamage} />
        </div>
      </CardContent>
    </Card>
  );
};

export default LifeCounter;
