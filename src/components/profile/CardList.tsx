
import React, { useState, useEffect } from 'react';
import { Card as MagicCard } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { List, Image, Maximize2, AlertCircle, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CardListProps {
  cards: MagicCard[];
  onCardSelect?: (card: MagicCard) => void;
  selectedCardUrl?: string;
}

const CardList: React.FC<CardListProps> = ({ cards, onCardSelect, selectedCardUrl }) => {
  const [viewMode, setViewMode] = useState<'text' | 'images'>('text');
  const [previewCard, setPreviewCard] = useState<MagicCard | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  
  // Load status tracking
  useEffect(() => {
    // Initialize loading state for all cards
    const newLoadingState: Record<string, boolean> = {};
    cards.forEach(card => {
      if (card.imageUrl) {
        newLoadingState[card.id] = true;
      }
    });
    setLoadingImages(newLoadingState);
  }, [cards]);
  
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
    if (card.imageUrl) {
      console.log(`Using provided image URL for ${card.name}:`, card.imageUrl);
      return card.imageUrl;
    }
    
    console.log(`No imageUrl for ${card.name}, using fallback`);
    
    // Fixed image URLs for basic lands to ensure they always work
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
    
    // Try to construct URL from set and collector number if they exist in the card object
    if (card.set && card.collectorNumber) {
      return `https://cards.scryfall.io/normal/front/${card.set}/${card.collectorNumber}.jpg`;
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

  const handleImageError = (cardId: string) => {
    console.error(`Image loading failed for card: ${cardId}`);
    setImageErrors(prev => ({ ...prev, [cardId]: true }));
    setLoadingImages(prev => ({ ...prev, [cardId]: false }));
    
    // Try alternative Gatherer image URL as last resort
    // Not doing this now as Gatherer images are not reliable either
  };
  
  const handleImageLoad = (cardId: string) => {
    console.log(`Image loaded successfully for card: ${cardId}`);
    setLoadingImages(prev => ({ ...prev, [cardId]: false }));
  };
  
  // Display a message if there are no cards
  if (sortedCards.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No cards in this deck</p>
      </div>
    );
  }

  // Calculate total cards
  const totalCards = sortedCards.reduce((acc, card) => acc + card.quantity, 0);
  const uniqueCards = sortedCards.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {totalCards} cards • {uniqueCards} unique
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
            <span className="hidden sm:inline">Grid</span>
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 rounded-full opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewCard(card);
                          }}
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xs sm:max-w-md md:max-w-lg p-0 overflow-hidden">
                        <AspectRatio ratio={63/88}>
                          <div className="relative h-full w-full">
                            {loadingImages[card.id] && !imageErrors[card.id] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                              </div>
                            )}
                            {imageErrors[card.id] ? (
                              <div className="h-full w-full flex flex-col items-center justify-center bg-muted">
                                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-center text-muted-foreground">{card.name}</p>
                              </div>
                            ) : (
                              <img 
                                src={getCardImageUrl(card)}
                                alt={card.name}
                                className="h-full w-full object-contain"
                                onError={() => handleImageError(card.id)}
                                onLoad={() => handleImageLoad(card.id)}
                              />
                            )}
                          </div>
                        </AspectRatio>
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{card.name}</h3>
                          <p className="text-muted-foreground">Quantity: {card.quantity}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sortedCards.map((card) => (
                <Dialog key={card.id}>
                  <DialogTrigger asChild>
                    <div 
                      className={`rounded-md overflow-hidden border cursor-pointer hover:shadow-md transition-all duration-200 ${
                        selectedCardUrl === card.imageUrl ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onCardSelect) {
                          onCardSelect(card);
                        }
                      }}
                    >
                      <AspectRatio ratio={63/88} className="relative">
                        {loadingImages[card.id] && !imageErrors[card.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                          </div>
                        )}
                        {imageErrors[card.id] ? (
                          <div className="h-full w-full flex flex-col items-center justify-center bg-muted">
                            <AlertCircle className="h-6 w-6 text-muted-foreground mb-1" />
                            <p className="text-center text-xs text-muted-foreground px-2">{card.name}</p>
                          </div>
                        ) : (
                          <img 
                            src={getCardImageUrl(card)}
                            alt={card.name}
                            className="h-full w-full object-cover"
                            onError={() => handleImageError(card.id)}
                            onLoad={() => handleImageLoad(card.id)}
                            loading="lazy"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1.5 text-xs">
                          <div className="truncate">{card.name}</div>
                          <div className="text-xs text-gray-300">×{card.quantity}</div>
                        </div>
                      </AspectRatio>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-xs sm:max-w-md md:max-w-lg p-0 overflow-hidden">
                    <AspectRatio ratio={63/88}>
                      <div className="relative h-full w-full">
                        {loadingImages[card.id] && !imageErrors[card.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                          </div>
                        )}
                        {imageErrors[card.id] ? (
                          <div className="h-full w-full flex flex-col items-center justify-center bg-muted">
                            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-center text-muted-foreground">{card.name}</p>
                          </div>
                        ) : (
                          <img 
                            src={getCardImageUrl(card)}
                            alt={card.name}
                            className="h-full w-full object-contain"
                            onError={() => handleImageError(card.id)}
                            onLoad={() => handleImageLoad(card.id)}
                          />
                        )}
                      </div>
                    </AspectRatio>
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{card.name}</h3>
                      <p className="text-muted-foreground">Quantity: {card.quantity}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Card preview for desktop */}
        {!isMobile && previewCard && (
          <div className="hidden md:block w-60 shrink-0">
            <div className="sticky top-4 rounded-md overflow-hidden shadow-lg">
              <div className="relative w-full">
                {loadingImages[previewCard.id] && !imageErrors[previewCard.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  </div>
                )}
                {imageErrors[previewCard.id] ? (
                  <div className="w-full h-80 flex flex-col items-center justify-center bg-muted rounded-md">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-center text-muted-foreground">{previewCard.name}</p>
                  </div>
                ) : (
                  <img 
                    src={getCardImageUrl(previewCard)}
                    alt={previewCard.name}
                    className="w-full h-auto rounded-md"
                    onError={() => handleImageError(previewCard.id)}
                    onLoad={() => handleImageLoad(previewCard.id)}
                  />
                )}
              </div>
              <div className="p-2 bg-card">
                <div className="font-medium truncate">{previewCard.name}</div>
                <div className="text-sm text-muted-foreground">Quantity: {previewCard.quantity}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardList;
