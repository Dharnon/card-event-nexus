
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card as MagicCard, CardSearchInputProps } from '@/types';
import { searchCardByName, ScryfallCard, getCardImageUrl, getBasicLand } from '@/services/ScryfallService';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BASIC_LANDS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];

const CardSearchInput: React.FC<CardSearchInputProps> = ({ onCardSelect, placeholder = "Search for a card..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCards = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        // Verificar si es una tierra básica primero
        const trimmedQuery = debouncedSearchQuery.trim();
        const isBasicLand = BASIC_LANDS.some(land => 
          land.toLowerCase().includes(trimmedQuery.toLowerCase())
        );
        
        let results;
        if (isBasicLand) {
          // Filtrar las tierras básicas que coincidan con la búsqueda
          const matchingLands = BASIC_LANDS.filter(land => 
            land.toLowerCase().includes(trimmedQuery.toLowerCase())
          );
          
          // Obtener los datos de cada tierra básica
          const landPromises = matchingLands.map(async land => {
            const landCard = await getBasicLand(land);
            return landCard;
          });
          
          const landResults = await Promise.all(landPromises);
          results = landResults.filter(Boolean) as ScryfallCard[];
        } else {
          // Búsqueda normal para cartas que no son tierras básicas
          results = await searchCardByName(debouncedSearchQuery);
        }
        
        setSearchResults(results.slice(0, 10)); // Limit to 10 results for better UX
        
        if (results.length === 0 && debouncedSearchQuery.trim().length >= 3) {
          toast({
            title: "No results found",
            description: `No cards found matching "${debouncedSearchQuery}"`,
            variant: "default",
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
  }, [debouncedSearchQuery, toast]);
  
  const handleSelectCard = (card: ScryfallCard) => {
    setSelectedCard(card);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const handleAddCard = () => {
    if (!selectedCard) return;
    
    const imageUrl = getCardImageUrl(selectedCard, 'normal');
    
    const newCard: MagicCard = {
      id: `card-${Date.now()}`,
      name: selectedCard.name,
      quantity: quantity,
      scryfallId: selectedCard.id,
      imageUrl: imageUrl,
    };
    
    onCardSelect(newCard);
    setSelectedCard(null);
    setQuantity(1);
    
    toast({
      title: "Card added",
      description: `${quantity}x ${selectedCard.name} added to your deck.`,
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
            {searchResults.map((card) => (
              <div
                key={card.id}
                className="p-2 hover:bg-accent cursor-pointer"
                onClick={() => handleSelectCard(card)}
              >
                {card.name}
                {card.type_line && <span className="text-xs text-muted-foreground ml-2">{card.type_line}</span>}
              </div>
            ))}
          </div>
        )}
        
        {isSearching && (
          <div className="absolute z-10 w-full mt-1 p-2 bg-background border rounded-md shadow-lg text-center">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Selected card preview */}
      {selectedCard && (
        <div className="border rounded-md p-4 flex flex-col sm:flex-row gap-4">
          <div className="shrink-0">
            <img 
              src={getCardImageUrl(selectedCard, 'normal')} 
              alt={selectedCard.name} 
              className="rounded-md w-40 h-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg";
              }}
            />
          </div>
          <div className="flex flex-col justify-between flex-1">
            <div>
              <h3 className="font-bold text-lg">{selectedCard.name}</h3>
              {selectedCard.type_line && (
                <p className="text-sm text-muted-foreground">{selectedCard.type_line}</p>
              )}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="mx-2">{quantity}</span>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
              <Button type="button" onClick={handleAddCard}>
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
