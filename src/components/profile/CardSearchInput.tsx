import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card as MagicCard, CardSearchInputProps } from '@/types';
import { searchCardByName, ScryfallCard, getCardImageUrl, getBasicLand } from '@/services/ScryfallService';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2, Plus, Minus, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const BASIC_LANDS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];

const CardSearchInput: React.FC<CardSearchInputProps> = ({ onCardSelect, placeholder = "Search for a card..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageRetries, setImageRetries] = useState(0);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Reset state when a new search begins
  useEffect(() => {
    if (debouncedSearchQuery.trim() !== searchQuery.trim()) {
      setSelectedCard(null);
      setImageError(false);
      setImageRetries(0);
    }
  }, [debouncedSearchQuery, searchQuery]);
  
  useEffect(() => {
    const fetchCards = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        // Check if it's a basic land first
        const trimmedQuery = debouncedSearchQuery.trim();
        const isBasicLand = BASIC_LANDS.some(land => 
          land.toLowerCase().includes(trimmedQuery.toLowerCase())
        );
        
        let results;
        if (isBasicLand) {
          // Filter basic lands that match the search
          const matchingLands = BASIC_LANDS.filter(land => 
            land.toLowerCase().includes(trimmedQuery.toLowerCase())
          );
          
          // Get data for each basic land
          const landPromises = matchingLands.map(async land => {
            const landCard = await getBasicLand(land);
            return landCard;
          });
          
          const landResults = await Promise.all(landPromises);
          results = landResults.filter(Boolean) as ScryfallCard[];
        } else {
          // Normal search for non-basic lands
          results = await searchCardByName(debouncedSearchQuery);
        }
        
        console.log("Search results:", results.map(card => card.name));
        setSearchResults(results.slice(0, 8)); // Limit results for better mobile experience
        
        if (results.length === 0 && debouncedSearchQuery.trim().length >= 3) {
          toast({
            title: "No results found",
            description: `No cards found matching "${debouncedSearchQuery}"`,
          });
        }
      } catch (error) {
        console.error('Error searching for cards:', error);
        toast({
          title: "Search error",
          description: "There was a problem searching for cards. Please try again.",
          variant: "destructive",
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    fetchCards();
  }, [debouncedSearchQuery]);
  
  const handleSelectCard = (card: ScryfallCard) => {
    console.log("Selected card:", card.name, card);
    setSelectedCard(card);
    setSearchQuery('');
    setSearchResults([]);
    setImageLoading(true);
    setImageError(false);
    setImageRetries(0);
  };
  
  const handleAddCard = () => {
    if (!selectedCard) return;
    
    const imageUrl = getCardImageUrl(selectedCard, 'normal');
    console.log("Adding card with image URL:", imageUrl);
    
    // Extract set and collector number if available
    const newCard: MagicCard = {
      id: `card-${selectedCard.id || Date.now()}-${Date.now()}`,
      name: selectedCard.name,
      quantity: quantity,
      scryfallId: selectedCard.id,
      imageUrl: imageUrl,
      set: selectedCard.set,
      collectorNumber: selectedCard.collector_number
    };
    
    onCardSelect(newCard);
    setSelectedCard(null);
    setQuantity(1);
    
    toast({
      title: "Card added",
      description: `${quantity}x ${selectedCard.name} added to your deck.`,
    });
  };
  
  const handleImageRetry = () => {
    if (selectedCard && imageRetries < 3) {
      console.log(`Retrying image load for ${selectedCard.name}, attempt ${imageRetries + 1}`);
      setImageError(false);
      setImageLoading(true);
      setImageRetries(prev => prev + 1);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background"
        />
        
        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-card border rounded-md shadow-lg max-h-[300px] overflow-auto">
            {searchResults.map((card) => (
              <div
                key={card.id}
                className="p-3 hover:bg-accent cursor-pointer border-b border-border/30 last:border-0 flex items-center"
                onClick={() => handleSelectCard(card)}
              >
                <div className="flex-1">
                  <div className="font-medium">{card.name}</div>
                  {card.type_line && <div className="text-xs text-muted-foreground">{card.type_line}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isSearching && (
          <div className="absolute z-20 w-full mt-1 p-3 bg-card border rounded-md shadow-lg text-center">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Selected card preview */}
      {selectedCard && (
        <div className="border rounded-xl p-4 flex flex-col sm:flex-row gap-4 bg-card shadow-md">
          <div className="shrink-0 relative flex justify-center">
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {imageError ? (
              <div className="w-40 h-56 border rounded-lg flex flex-col items-center justify-center bg-muted">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center px-2">{selectedCard.name}</p>
                {imageRetries < 3 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleImageRetry}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                )}
              </div>
            ) : (
              <img 
                src={getCardImageUrl(selectedCard, 'normal')} 
                alt={selectedCard.name} 
                className="rounded-lg w-40 h-auto mx-auto shadow-md"
                onLoad={() => {
                  console.log("Image loaded successfully");
                  setImageLoading(false);
                }}
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  setImageLoading(false);
                  setImageError(true);
                  
                  // Try alternative URL if available
                  if (selectedCard.set && selectedCard.collector_number && imageRetries === 0) {
                    console.log("Trying direct CDN URL");
                    const alternativeUrl = `https://cards.scryfall.io/normal/front/${selectedCard.set}/${selectedCard.collector_number}.jpg`;
                    (e.target as HTMLImageElement).src = alternativeUrl;
                    setImageRetries(1);
                    setImageError(false);
                    return;
                  }
                  
                  // Final fallback to card back
                  (e.target as HTMLImageElement).src = "https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg";
                }}
              />
            )}
          </div>
          <div className="flex flex-col justify-between flex-1">
            <div>
              <h3 className="font-bold text-lg">{selectedCard.name}</h3>
              {selectedCard.type_line && (
                <p className="text-sm text-muted-foreground">{selectedCard.type_line}</p>
              )}
              {selectedCard.set && selectedCard.collector_number && (
                <p className="text-xs text-muted-foreground mt-1">
                  Set: {selectedCard.set.toUpperCase()} • #{selectedCard.collector_number}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between mt-4">
              <div className="flex items-center">
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-medium">{quantity}</span>
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon" 
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                type="button" 
                onClick={handleAddCard} 
                className="w-full sm:w-auto"
              >
                Add to deck
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSearchInput;
