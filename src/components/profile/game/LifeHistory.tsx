
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LifeChange {
  player: 'player' | 'opponent';
  amount: number;
  type: 'fetch' | 'creature' | 'spell' | 'gain' | 'generic';
  timestamp: string;
  lifeAfterChange?: number;
}

interface LifeHistoryProps {
  history: LifeChange[];
}

const LifeHistory = ({ history }: LifeHistoryProps) => {
  return (
    <ScrollArea className="h-full w-full rounded-md">
      {history.length === 0 && (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          No hay cambios de vida aún
        </div>
      )}
      
      {history.map((change, index) => (
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
          <span className="text-sm font-bold">
            {change.lifeAfterChange !== undefined ? `→ ${change.lifeAfterChange}` : ''}
          </span>
        </div>
      ))}
    </ScrollArea>
  );
};

export default LifeHistory;
