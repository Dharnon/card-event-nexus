
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserDecks, createDeck, updateDeck, deleteDeck } from '@/services/ProfileService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Deck, EventFormat, Card as MagicCard } from '@/types';
import { PlusCircle } from 'lucide-react';
import DeckForm from './DeckForm';
import CardList from './CardList';

const DeckManager = () => {
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  
  const queryClient = useQueryClient();
  
  // Fetch user decks
  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['userDecks'],
    queryFn: () => getUserDecks(),
  });
  
  // Create new deck mutation
  const createDeckMutation = useMutation({
    mutationFn: createDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDecks'] });
      setIsAddingDeck(false);
    },
  });
  
  // Update deck mutation
  const updateDeckMutation = useMutation({
    mutationFn: ({ deckId, updates }: { deckId: string; updates: Partial<Deck> }) =>
      updateDeck(deckId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDecks'] });
      setEditingDeck(null);
    },
  });
  
  // Delete deck mutation
  const deleteDeckMutation = useMutation({
    mutationFn: deleteDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDecks'] });
      if (selectedDeck) setSelectedDeck(null);
    },
  });
  
  // Handle form submission for new deck
  const handleCreateDeck = (name: string, format: EventFormat, cards: MagicCard[]) => {
    createDeckMutation.mutate({
      name,
      format,
      cards,
    });
  };
  
  // Handle form submission for updating deck
  const handleUpdateDeck = (deckId: string, name: string, format: EventFormat, cards: MagicCard[]) => {
    updateDeckMutation.mutate({
      deckId,
      updates: {
        name,
        format,
        cards,
      },
    });
  };
  
  // Handle deck deletion
  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este mazo?')) {
      deleteDeckMutation.mutate(deckId);
    }
  };
  
  // Select a deck to view details
  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsAddingDeck(false);
    setEditingDeck(null);
  };
  
  // Cancel form
  const handleCancelForm = () => {
    setIsAddingDeck(false);
    setEditingDeck(null);
  };
  
  if (isLoading) {
    return <div className="flex justify-center my-8">Cargando mazos...</div>;
  }
  
  // Show deck form (create or edit)
  if (isAddingDeck || editingDeck) {
    return (
      <DeckForm 
        deck={editingDeck}
        onSubmit={editingDeck 
          ? (name, format, cards) => handleUpdateDeck(editingDeck.id, name, format, cards) 
          : handleCreateDeck
        }
        onCancel={handleCancelForm}
      />
    );
  }
  
  // Show selected deck details
  if (selectedDeck) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedDeck(null)}>
            Volver a la lista
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setEditingDeck(selectedDeck)}>
              Editar mazo
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteDeck(selectedDeck.id)}
            >
              Eliminar mazo
            </Button>
          </div>
        </div>
        
        <div className="magic-card p-6">
          <h2 className="text-2xl font-bold mb-4">{selectedDeck.name}</h2>
          <div className="mb-4">
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {selectedDeck.format}
            </span>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Lista de cartas</h3>
            <CardList cards={selectedDeck.cards} />
          </div>
        </div>
      </div>
    );
  }
  
  // Show deck list
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Mazos</h2>
        <Button onClick={() => setIsAddingDeck(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Mazo
        </Button>
      </div>
      
      {decks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Aún no tienes mazos creados</p>
          <Button onClick={() => setIsAddingDeck(true)}>
            Crear tu primer mazo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Card 
              key={deck.id} 
              className="magic-card magic-card-hover cursor-pointer"
              onClick={() => handleSelectDeck(deck)}
            >
              <CardHeader>
                <CardTitle>{deck.name}</CardTitle>
                <CardDescription>
                  Formato: {deck.format}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{deck.cards.length} cartas</p>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Actualizado: {new Date(deck.updatedAt).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckManager;
