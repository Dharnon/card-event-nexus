
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card as MagicCard, CardSearchInputProps } from '@/types';
import { searchCardByName, ScryfallCard, getCardImageUrl } from '@/services/ScryfallService';
import { useDebounce } from '@/hooks/useDebounce';

const CardSearchInput: React.FC<CardSearchInputProps> = ({ onCardSelect, placeholder = "Search for a card..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  useEffect(() => {
    const fetchCards = async () => {
      if (debouncedSearchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await searchCardByName(debouncedSearchQuery);
        setSearchResults(results.slice(0, 5)); // Limit to 5 results
      } catch (error) {
        console.error('Error searching for cards:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    fetchCards();
  }, [debouncedSearchQuery]);
  
  const handleSelectCard = (card: ScryfallCard) => {
    setSelectedCard(card);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const handleAddCard = () => {
    if (!selectedCard) return;
    
    const newCard: MagicCard = {
      id: `card-${Date.now()}`,
      name: selectedCard.name,
      quantity: quantity,
      scryfallId: selectedCard.id,
      imageUrl: getCardImageUrl(selectedCard),
    };
    
    onCardSelect(newCard); // Using the onCardSelect prop correctly
    setSelectedCard(null);
    setQuantity(1);
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
              </div>
            ))}
          </div>
        )}
        
        {isSearching && (
          <div className="absolute z-10 w-full mt-1 p-2 bg-background border rounded-md shadow-lg text-center">
            Buscando...
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
            />
          </div>
          <div className="flex flex-col justify-between flex-1">
            <div>
              <h3 className="font-bold text-lg">{selectedCard.name}</h3>
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
                Añadir al mazo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSearchInput;
