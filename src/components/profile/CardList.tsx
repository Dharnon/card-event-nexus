
import React from 'react';
import { Card } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CardListProps {
  cards: Card[];
  onCardSelect?: (card: Card) => void;
  selectedCardUrl?: string;
}

const CardList: React.FC<CardListProps> = ({ cards, onCardSelect, selectedCardUrl }) => {
  // Group cards by name and sum quantities
  const groupedCards = cards.reduce((acc, card) => {
    const existingCard = acc.find(c => c.name === card.name);
    if (existingCard) {
      existingCard.quantity += card.quantity;
    } else {
      acc.push({ ...card });
    }
    return acc;
  }, [] as Card[]);

  // Sort cards alphabetically
  const sortedCards = [...groupedCards].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <ScrollArea className="h-[400px] rounded-md border p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedCards.map((card) => (
            <div 
              key={card.id} 
              className={`flex items-center p-2 rounded-md ${
                onCardSelect ? 'cursor-pointer hover:bg-muted/50' : ''
              } ${selectedCardUrl === card.imageUrl ? 'bg-muted' : ''}`}
              onClick={() => onCardSelect && onCardSelect(card)}
            >
              <div className="flex-1 flex items-center">
                {card.imageUrl && (
                  <img 
                    src={card.imageUrl} 
                    alt={card.name} 
                    className="w-12 h-16 object-cover rounded-sm mr-3"
                  />
                )}
                <div>
                  <p className="font-medium">{card.name}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {card.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default CardList;
