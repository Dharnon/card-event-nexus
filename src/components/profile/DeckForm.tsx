
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Deck, EventFormat, Card as MagicCard } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CardSearchInput from './CardSearchInput';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ImageIcon, X } from 'lucide-react';

interface DeckFormProps {
  deck?: Deck | null;
  onSubmit: (name: string, format: EventFormat, cards: MagicCard[], cardBackgroundUrl?: string) => void;
  onCancel: () => void;
}

const DeckForm: React.FC<DeckFormProps> = ({ deck, onSubmit, onCancel }) => {
  const [name, setName] = useState(deck?.name || '');
  const [format, setFormat] = useState<EventFormat>(deck?.format || 'Standard');
  const [cards, setCards] = useState<MagicCard[]>(deck?.cards || []);
  const [cardBackgroundUrl, setCardBackgroundUrl] = useState<string | undefined>(deck?.cardBackgroundUrl);
  const [selectedCardForBackground, setSelectedCardForBackground] = useState<MagicCard | null>(null);
  
  useEffect(() => {
    if (cardBackgroundUrl) {
      const matchingCard = cards.find(card => card.imageUrl === cardBackgroundUrl);
      if (matchingCard) {
        setSelectedCardForBackground(matchingCard);
      }
    }
  }, [cards, cardBackgroundUrl]);
  
  const handleAddCard = (newCard: MagicCard) => {
    // Check if card already exists
    const existingCard = cards.find(card => card.name.toLowerCase() === newCard.name.toLowerCase());
    
    if (existingCard) {
      // Update quantity if card exists
      const updatedCards = cards.map(card => 
        card.name.toLowerCase() === newCard.name.toLowerCase() 
          ? { ...card, quantity: card.quantity + newCard.quantity }
          : card
      );
      setCards(updatedCards);
    } else {
      // Add new card
      setCards([...cards, newCard]);
      
      // If this is the first card with an image and no background is selected yet, use it
      if (!cardBackgroundUrl && newCard.imageUrl) {
        setCardBackgroundUrl(newCard.imageUrl);
        setSelectedCardForBackground(newCard);
      }
    }
  };
  
  const handleRemoveCard = (cardId: string) => {
    const cardToRemove = cards.find(card => card.id === cardId);
    setCards(cards.filter(card => card.id !== cardId));
    
    // If removed card was the background, reset background
    if (cardToRemove?.imageUrl === cardBackgroundUrl) {
      setCardBackgroundUrl(undefined);
      setSelectedCardForBackground(null);
    }
  };
  
  const handleUpdateCardQuantity = (cardId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCard(cardId);
      return;
    }
    
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, quantity: newQuantity } : card
    ));
  };
  
  const handleSetCardAsBackground = (card: MagicCard) => {
    if (card.imageUrl) {
      setCardBackgroundUrl(card.imageUrl);
      setSelectedCardForBackground(card);
    }
  };
  
  const handleClearBackground = () => {
    setCardBackgroundUrl(undefined);
    setSelectedCardForBackground(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, introduce un nombre para el mazo');
      return;
    }
    
    if (cards.length === 0) {
      alert('Por favor, añade al menos una carta al mazo');
      return;
    }
    
    onSubmit(name, format, cards, cardBackgroundUrl);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle>{deck ? 'Editar Mazo' : 'Nuevo Mazo'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="space-y-4 md:w-2/3">
              <div className="space-y-2">
                <Label htmlFor="deck-name">Nombre del Mazo</Label>
                <Input 
                  id="deck-name" 
                  placeholder="Nombre del mazo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deck-format">Formato</Label>
                <Select value={format} onValueChange={(value) => setFormat(value as EventFormat)}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Selecciona un formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Modern">Modern</SelectItem>
                    <SelectItem value="Legacy">Legacy</SelectItem>
                    <SelectItem value="Commander">Commander</SelectItem>
                    <SelectItem value="Pioneer">Pioneer</SelectItem>
                    <SelectItem value="Vintage">Vintage</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sealed">Sealed</SelectItem>
                    <SelectItem value="Prerelease">Prerelease</SelectItem>
                    <SelectItem value="Other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Card Background Preview */}
            <div className="md:w-1/3 space-y-2">
              <Label>Carta destacada</Label>
              
              {cardBackgroundUrl ? (
                <div className="relative">
                  <AspectRatio ratio={488/680} className="rounded-lg overflow-hidden border border-border/50">
                    <img 
                      src={cardBackgroundUrl} 
                      alt="Deck Featured Card" 
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={handleClearBackground}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-lg flex items-center justify-center h-40 bg-background/50">
                  <div className="text-center p-4">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Selecciona una carta para destacarla</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <Label>Cartas</Label>
            <div className="mt-2">
              <CardSearchInput onCardSelect={handleAddCard} placeholder="Buscar carta..." />
            </div>
            
            {cards.length > 0 && (
              <div className="mt-4 border rounded-md bg-background/50 border-border/50">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2">Cantidad</th>
                      <th className="text-left p-2">Nombre</th>
                      <th className="text-center p-2">Portada</th>
                      <th className="text-right p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((card) => (
                      <tr key={card.id} className={`border-t hover:bg-muted/30 transition-colors ${card.imageUrl === cardBackgroundUrl ? 'bg-primary/5' : ''}`}>
                        <td className="p-2">
                          <div className="flex items-center">
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => handleUpdateCardQuantity(card.id, card.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="mx-2">{card.quantity}</span>
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => handleUpdateCardQuantity(card.id, card.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="p-2">{card.name}</td>
                        <td className="p-2 text-center">
                          {card.imageUrl && (
                            <Button
                              type="button"
                              variant={card.imageUrl === cardBackgroundUrl ? "default" : "outline"}
                              size="sm"
                              className="h-7"
                              onClick={() => handleSetCardAsBackground(card)}
                            >
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {card.imageUrl === cardBackgroundUrl ? 'Seleccionada' : 'Seleccionar'}
                            </Button>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveCard(card.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {deck ? 'Guardar cambios' : 'Crear mazo'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default DeckForm;
