
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Deck, EventFormat, Card as MagicCard } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CardSearchInput from './CardSearchInput';

interface DeckFormProps {
  deck?: Deck | null;
  onSubmit: (name: string, format: EventFormat, cards: MagicCard[]) => void;
  onCancel: () => void;
}

const DeckForm: React.FC<DeckFormProps> = ({ deck, onSubmit, onCancel }) => {
  const [name, setName] = useState(deck?.name || '');
  const [format, setFormat] = useState<EventFormat>(deck?.format || 'Standard');
  const [cards, setCards] = useState<MagicCard[]>(deck?.cards || []);
  
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
    }
  };
  
  const handleRemoveCard = (cardId: string) => {
    setCards(cards.filter(card => card.id !== cardId));
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
    
    onSubmit(name, format, cards);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="magic-card">
        <CardHeader>
          <CardTitle>{deck ? 'Editar Mazo' : 'Nuevo Mazo'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deck-name">Nombre del Mazo</Label>
            <Input 
              id="deck-name" 
              placeholder="Nombre del mazo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deck-format">Formato</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as EventFormat)}>
              <SelectTrigger>
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
          
          <div className="pt-4">
            <Label>Cartas</Label>
            <div className="mt-2">
              <CardSearchInput onCardSelect={handleAddCard} placeholder="Buscar carta..." />
            </div>
            
            {cards.length > 0 && (
              <div className="mt-4 border rounded-md">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Cantidad</th>
                      <th className="text-left p-2">Nombre</th>
                      <th className="text-right p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((card) => (
                      <tr key={card.id} className="border-t">
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
