import React, { useState } from 'react';
import { Card as MagicCard } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { List, Image } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
interface CardListProps {
  cards: MagicCard[];
  onCardSelect?: (card: MagicCard) => void;
  selectedCardUrl?: string;
}
const CardList: React.FC<CardListProps> = ({
  cards,
  onCardSelect,
  selectedCardUrl
}) => {
  const [viewMode, setViewMode] = useState<'text' | 'images'>('text');
  const [hoveredCard, setHoveredCard] = useState<MagicCard | null>(null);

  // Group cards by name and sum quantities
  const groupedCards = cards.reduce((acc, card) => {
    const existingCard = acc.find(c => c.name === card.name);
    if (existingCard) {
      existingCard.quantity += card.quantity;
    } else {
      acc.push({
        ...card
      });
    }
    return acc;
  }, [] as MagicCard[]);

  // Sort cards alphabetically
  const sortedCards = [...groupedCards].sort((a, b) => a.name.localeCompare(b.name));

  // Helper function to handle special basic lands to get proper Scryfall images
  const getCardImageUrl = (card: MagicCard) => {
    // If we already have an image URL, use it
    if (card.imageUrl) return card.imageUrl;

    // Basic land handling for consistent art
    if (card.name === "Plains") {
      return "https://cards.scryfall.io/normal/front/5/f/5fc26aa1-58b9-41b5-95b4-7e9bf2309b54.jpg";
    } else if (card.name === "Island") {
      return "https://cards.scryfall.io/normal/front/d/c/dc41cb44-ebdb-4a58-b95e-c4c4cded7033.jpg";
    } else if (card.name === "Swamp") {
      return "https://cards.scryfall.io/normal/front/8/3/83249211-164c-456c-8bda-ca3a607ada7e.jpg";
    } else if (card.name === "Mountain") {
      return "https://cards.scryfall.io/normal/front/4/4/44c1a862-00fc-4e79-a83a-289fef81503a.jpg";
    } else if (card.name === "Forest") {
      return "https://cards.scryfall.io/normal/front/c/f/cfb41b34-4037-4a3c-9a6d-def7bfda5635.jpg";
    }
    return "";
  };
  return <div className="space-y-4">
      <div className="flex justify-between items-center mx-[40px]">
        <div className="text-sm text-muted-foreground">
          {sortedCards.reduce((acc, card) => acc + card.quantity, 0)} cards • {sortedCards.length} unique
        </div>
        <div className="flex space-x-2">
          <Button variant={viewMode === 'text' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('text')}>
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button variant={viewMode === 'images' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('images')}>
            <Image className="h-4 w-4 mr-1" />
            Images
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px] rounded-md border p-4 px-[28px] mx-0">
        {viewMode === 'text' ? <div className="space-y-2">
            {sortedCards.map(card => <div key={card.id} className={`p-2 rounded-md border ${onCardSelect ? 'cursor-pointer hover:bg-muted/50' : ''} ${selectedCardUrl === card.imageUrl ? 'bg-muted' : ''}`} onClick={() => onCardSelect && onCardSelect(card)} onMouseEnter={() => setHoveredCard(card)} onMouseLeave={() => setHoveredCard(null)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="font-medium">{card.name}</div>
                    <div className="ml-2 text-muted-foreground">x{card.quantity}</div>
                  </div>
                  {hoveredCard === card && card.imageUrl && <div className="fixed ml-4 z-50 shadow-lg" style={{
              transform: 'translateX(100%)'
            }}>
                      <img src={getCardImageUrl(card)} alt={card.name} className="rounded-md h-64 w-auto" />
                    </div>}
                </div>
              </div>)}
          </div> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sortedCards.map(card => <div key={card.id} className={`rounded-md overflow-hidden border cursor-pointer ${selectedCardUrl === card.imageUrl ? 'ring-2 ring-primary' : ''}`} onClick={() => onCardSelect && onCardSelect(card)}>
                {card.imageUrl || getCardImageUrl(card) ? <div className="aspect-[63/88] relative">
                    <img src={getCardImageUrl(card)} alt={card.name} className="h-full w-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 text-xs">
                      <div className="truncate">{card.name}</div>
                      <div className="text-xs text-gray-300">x{card.quantity}</div>
                    </div>
                  </div> : <div className="aspect-[63/88] bg-muted flex flex-col items-center justify-center p-2 text-center">
                    <div className="font-medium truncate w-full">{card.name}</div>
                    <div className="text-xs text-muted-foreground">x{card.quantity}</div>
                  </div>}
              </div>)}
          </div>}
      </ScrollArea>
    </div>;
};
export default CardList;