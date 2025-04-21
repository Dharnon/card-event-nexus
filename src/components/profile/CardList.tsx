
import React, { useState, useEffect } from 'react';
import { Card as MagicCard } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { searchCardByName, getCardImageUrl, ScryfallCard } from '@/services/ScryfallService';
import { useDebounce } from '@/hooks/useDebounce';

interface CardListProps {
  cards: MagicCard[];
}

interface CardsByType {
  [key: string]: MagicCard[];
}

// This is a simplified version - in a real app you'd want to categorize by actual card types
const getCardType = (cardName: string): string => {
  const lowercaseName = cardName.toLowerCase();
  
  if (lowercaseName.includes('island') || lowercaseName.includes('mountain') || 
      lowercaseName.includes('swamp') || lowercaseName.includes('forest') || 
      lowercaseName.includes('plains')) {
    return 'Tierras';
  }
  
  if (lowercaseName.includes('instant') || lowercaseName.includes('instante') || 
      lowercaseName.includes('sorcery') || lowercaseName.includes('conjuro')) {
    return 'Hechizos';
  }
  
  if (lowercaseName.includes('creature') || lowercaseName.includes('criatura')) {
    return 'Criaturas';
  }
  
  if (lowercaseName.includes('artifact') || lowercaseName.includes('artefacto')) {
    return 'Artefactos';
  }
  
  if (lowercaseName.includes('enchantment') || lowercaseName.includes('encantamiento')) {
    return 'Encantamientos';
  }
  
  if (lowercaseName.includes('planeswalker')) {
    return 'Planeswalkers';
  }
  
  return 'Otros';
};

const CardList: React.FC<CardListProps> = ({ cards }) => {
  const [view, setView] = useState<'list' | 'gallery'>('list');
  const [cardImages, setCardImages] = useState<Record<string, string>>({});
  
  // Load card images from Scryfall
  useEffect(() => {
    const loadCardImages = async () => {
      for (const card of cards) {
        if (!cardImages[card.name]) {
          try {
            const searchResults = await searchCardByName(card.name);
            if (searchResults.length > 0) {
              const imageUrl = getCardImageUrl(searchResults[0], 'normal');
              setCardImages(prev => ({
                ...prev,
                [card.name]: imageUrl
              }));
            }
          } catch (error) {
            console.error(`Error loading image for ${card.name}:`, error);
          }
        }
      }
    };

    loadCardImages();
  }, [cards]);

  // Group cards by type
  const cardsByType: CardsByType = cards.reduce((acc, card) => {
    const type = getCardType(card.name);
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push({
      ...card,
      imageUrl: cardImages[card.name]
    });
    return acc;
  }, {} as CardsByType);
  
  // Sort cards by name within each type
  Object.keys(cardsByType).forEach(type => {
    cardsByType[type].sort((a, b) => a.name.localeCompare(b.name));
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Total: {cards.reduce((sum, card) => sum + card.quantity, 0)} cartas</h3>
        <div className="border rounded-md overflow-hidden">
          <button 
            className={`px-3 py-1 ${view === 'list' ? 'bg-primary text-white' : 'bg-transparent'}`}
            onClick={() => setView('list')}
          >
            Lista
          </button>
          <button 
            className={`px-3 py-1 ${view === 'gallery' ? 'bg-primary text-white' : 'bg-transparent'}`}
            onClick={() => setView('gallery')}
          >
            Galería
          </button>
        </div>
      </div>
      
      {view === 'list' ? (
        <div className="space-y-6">
          {Object.entries(cardsByType).map(([type, cards]) => (
            <div key={type}>
              <h4 className="font-medium text-lg mb-2">{type}</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Cantidad</th>
                      <th className="text-left p-2">Nombre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((card) => (
                      <tr key={card.id} className="border-t hover:bg-muted/50">
                        <td className="p-2 text-center w-16">{card.quantity}</td>
                        <td className="p-2">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span className="cursor-help">{card.name}</span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-auto p-0">
                              {cardImages[card.name] && (
                                <img 
                                  src={cardImages[card.name]} 
                                  alt={card.name}
                                  className="rounded-lg"
                                  style={{ maxWidth: '240px' }}
                                />
                              )}
                            </HoverCardContent>
                          </HoverCard>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="rounded-md overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              {cardImages[card.name] ? (
                <div className="relative">
                  <img 
                    src={cardImages[card.name]} 
                    alt={card.name} 
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <div className="absolute top-0 left-0 bg-background/80 text-foreground px-2 py-1 rounded-br-md">
                    {card.quantity}
                  </div>
                </div>
              ) : (
                <div className="bg-muted aspect-[2.5/3.5] flex items-center justify-center p-2 text-center">
                  <div>
                    <div className="font-bold">{card.name}</div>
                    <div className="mt-2 text-sm">×{card.quantity}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardList;
