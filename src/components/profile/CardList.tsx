
import React, { useState } from 'react';
import { Card as MagicCard } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { List, Image, ExternalLink } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CardListProps {
  cards: MagicCard[];
  onCardSelect?: (card: MagicCard) => void;
  selectedCardUrl?: string;
}

const CardList: React.FC<CardListProps> = ({ cards, onCardSelect, selectedCardUrl }) => {
  const [viewMode, setViewMode] = useState<'text' | 'images'>('text');
  const [previewCard, setPreviewCard] = useState<MagicCard | null>(null);
  const isMobile = useIsMobile();
  
  // Group cards by name and sum quantities
  const groupedCards = cards.reduce((acc, card) => {
    const existingCard = acc.find(c => c.name === card.name);
    if (existingCard) {
      existingCard.quantity += card.quantity;
    } else {
      acc.push({ ...card });
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
    
    // Fallback to card back if no image
    return "https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg";
  };

  const handleCardClick = (card: MagicCard) => {
    if (onCardSelect) {
      onCardSelect(card);
    }
    setPreviewCard(card);
  };
  
  // Display a message if there are no cards
  if (sortedCards.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No cards in this deck</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {sortedCards.reduce((acc, card) => acc + card.quantity, 0)} cards • {sortedCards.length} unique
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('text')}
            title="List View"
          >
            <List className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">List</span>
          </Button>
          <Button
            variant={viewMode === 'images' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('images')}
            title="Grid View"
          >
            <Image className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Images</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <ScrollArea className="h-[400px] rounded-md border p-4 flex-1 bg-card/50">
          {viewMode === 'text' ? (
            <div className="space-y-2">
              {sortedCards.map((card) => (
                <div 
                  key={card.id} 
                  className={`p-3 rounded-md border ${
                    onCardSelect ? 'cursor-pointer hover:bg-muted transition-colors duration-200' : ''
                  } ${selectedCardUrl === card.imageUrl ? 'bg-muted ring-1 ring-primary' : ''}`}
                  onClick={() => handleCardClick(card)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="font-medium">{card.name}</div>
                      <div className="ml-2 text-muted-foreground">×{card.quantity}</div>
                    </div>
                    {!isMobile && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 rounded-full opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewCard(card);
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sortedCards.map((card) => (
                <div 
                  key={card.id}
                  className={`rounded-md overflow-hidden border cursor-pointer hover:shadow-md transition-all duration-200 ${
                    selectedCardUrl === card.imageUrl ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleCardClick(card)}
                >
                  <AspectRatio ratio={63/88} className="relative">
                    <img 
                      src={getCardImageUrl(card)}
                      alt={card.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg";
                      }}
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1.5 text-xs">
                      <div className="truncate">{card.name}</div>
                      <div className="text-xs text-gray-300">×{card.quantity}</div>
                    </div>
                  </AspectRatio>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Card preview for desktop */}
        {!isMobile && previewCard && (
          <div className="hidden md:block w-60 shrink-0">
            <div className="sticky top-4 rounded-md overflow-hidden shadow-lg">
              <img 
                src={getCardImageUrl(previewCard)}
                alt={previewCard.name}
                className="w-full h-auto rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg";
                }}
              />
              <div className="p-2 bg-card">
                <div className="font-medium truncate">{previewCard.name}</div>
                <div className="text-sm text-muted-foreground">Quantity: {previewCard.quantity}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile preview overlay */}
        {isMobile && previewCard && viewMode === 'text' && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" 
               onClick={() => setPreviewCard(null)}>
            <div className="max-w-[300px] bg-card rounded-lg overflow-hidden" 
                 onClick={(e) => e.stopPropagation()}>
              <img 
                src={getCardImageUrl(previewCard)}
                alt={previewCard.name}
                className="w-full h-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg";
                }}
              />
              <div className="p-3">
                <div className="font-medium">{previewCard.name}</div>
                <div className="text-sm text-muted-foreground">Quantity: {previewCard.quantity}</div>
                <Button className="w-full mt-3" onClick={() => setPreviewCard(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardList;
