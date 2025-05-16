
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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

// Function to get badge color based on type
const getBadgeColor = (type: string, amount: number) => {
  if (amount > 0) return 'bg-green-500/20 text-green-500 border-green-500/50';
  
  switch(type) {
    case 'creature':
      return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
    case 'spell':
      return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
    case 'fetch':
      return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
    default:
      return 'bg-red-500/20 text-red-500 border-red-500/50';
  }
};

const LifeHistory = ({ history }: LifeHistoryProps) => {
  return (
    <ScrollArea className="h-full w-full rounded-md">
      {history.length === 0 && (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          No life changes yet
        </div>
      )}
      
      {history.map((change, index) => (
        <div 
          key={index} 
          className={`flex items-center justify-between py-3 px-4 ${
            index % 2 === 0 ? 'bg-background/5' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={getBadgeColor(change.type, change.amount)}
            >
              {change.amount > 0 ? '+' : ''}{change.amount}
            </Badge>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {change.player === 'player' ? 'You' : 'Opponent'}
              </span>
              <span className="text-xs text-muted-foreground">
                {change.timestamp}
              </span>
            </div>
          </div>
          
          {change.lifeAfterChange !== undefined && (
            <div className="flex items-center">
              <span className="text-sm font-bold">
                → {change.lifeAfterChange}
              </span>
            </div>
          )}
        </div>
      ))}
    </ScrollArea>
  );
};

export default LifeHistory;
