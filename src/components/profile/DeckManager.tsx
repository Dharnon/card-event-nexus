import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserDecks, createDeck, updateDeck, deleteDeck } from '@/services/ProfileService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Deck, EventFormat, Card as MagicCard, SideboardGuide, DeckPhoto } from '@/types';
import { PlusCircle, ImageIcon, Download, Upload } from 'lucide-react';
import DeckForm from './DeckForm';
import CardList from './CardList';
import SideboardGuideComponent from './SideboardGuide';
import DeckPhotoGallery from './DeckPhotoGallery';
import DeckImportExport from './DeckImportExport';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';

const DeckManager = () => {
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [selectedTab, setSelectedTab] = useState<'cards' | 'sideboard' | 'photos' | 'import-export'>('cards');
  const [selectedCardAsBackground, setSelectedCardAsBackground] = useState<{ [key: string]: string }>({});
  const [viewSideboard, setViewSideboard] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['userDecks'],
    queryFn: () => getUserDecks(),
  });
  
  const createDeckMutation = useMutation({
    mutationFn: createDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDecks'] });
      setIsAddingDeck(false);
    },
  });
  
  const updateDeckMutation = useMutation({
    mutationFn: ({ deckId, updates }: { deckId: string; updates: Partial<Deck> }) =>
      updateDeck(deckId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDecks'] });
      setEditingDeck(null);
    },
  });
  
  const deleteDeckMutation = useMutation({
    mutationFn: deleteDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDecks'] });
      if (selectedDeck) setSelectedDeck(null);
    },
  });
  
  const handleCreateDeck = (name: string, format: EventFormat, cards: MagicCard[], cardBackgroundUrl?: string) => {
    createDeckMutation.mutate({
      name,
      format,
      cards,
      cardBackgroundUrl
    });
  };
  
  const handleUpdateDeck = (deckId: string, name: string, format: EventFormat, cards: MagicCard[], cardBackgroundUrl?: string) => {
    updateDeckMutation.mutate({
      deckId,
      updates: {
        name,
        format,
        cards,
        cardBackgroundUrl
      },
    });
  };
  
  const handleSaveSideboardGuide = (guide: SideboardGuide) => {
    if (!selectedDeck) return;
    
    updateDeckMutation.mutate({
      deckId: selectedDeck.id,
      updates: {
        sideboardGuide: guide,
      },
    });
  };

  const handleSavePhotos = (photos: DeckPhoto[]) => {
    if (!selectedDeck) return;
    
    updateDeckMutation.mutate({
      deckId: selectedDeck.id,
      updates: {
        photos: photos,
      },
    });
  };
  
  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este mazo?')) {
      deleteDeckMutation.mutate(deckId);
    }
  };
  
  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsAddingDeck(false);
    setEditingDeck(null);
  };
  
  const handleCancelForm = () => {
    setIsAddingDeck(false);
    setEditingDeck(null);
  };

  const handleSetCardAsBackground = (deckId: string, cardImageUrl: string) => {
    updateDeckMutation.mutate({
      deckId,
      updates: {
        cardBackgroundUrl: cardImageUrl
      }
    });

    setSelectedCardAsBackground(prev => ({
      ...prev,
      [deckId]: cardImageUrl
    }));
  };
  
  const selectCardForBackground = (card: MagicCard) => {
    if (!selectedDeck) return;
    
    if (card.imageUrl) {
      handleSetCardAsBackground(selectedDeck.id, card.imageUrl);
    }
  };
  
  const handleImportDeck = (deckData: { 
    name: string, 
    format: string, 
    cards: MagicCard[], 
    sideboardCards?: MagicCard[] 
  }) => {
    createDeckMutation.mutate({
      name: deckData.name,
      format: deckData.format as EventFormat,
      cards: deckData.cards,
      sideboardCards: deckData.sideboardCards
    });
    
    const sideboardMsg = deckData.sideboardCards?.length 
      ? ` and ${deckData.sideboardCards.length} sideboard cards` 
      : '';
    
    toast({
      title: "Deck imported",
      description: `Successfully imported ${deckData.name} with ${deckData.cards.length} maindeck cards${sideboardMsg}`
    });
  };
  
  if (isLoading) {
    return <div className="flex justify-center my-8">Cargando mazos...</div>;
  }
  
  if (isAddingDeck || editingDeck) {
    return (
      <DeckForm 
        deck={editingDeck}
        onSubmit={editingDeck 
          ? (name, format, cards, cardBackgroundUrl) => handleUpdateDeck(editingDeck.id, name, format, cards, cardBackgroundUrl) 
          : handleCreateDeck
        }
        onCancel={handleCancelForm}
      />
    );
  }
  
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
        
        <div className="enhanced-card p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {selectedDeck.cardBackgroundUrl && (
              <div className="md:w-1/4 w-full">
                <AspectRatio ratio={488/680} className="rounded-lg overflow-hidden border border-border/50">
                  <img 
                    src={selectedDeck.cardBackgroundUrl} 
                    alt="Deck Featured Card" 
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
            )}
            <div className={selectedDeck.cardBackgroundUrl ? "md:w-3/4 w-full" : "w-full"}>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{selectedDeck.name}</h2>
              <div className="mb-4">
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {selectedDeck.format}
                </span>
              </div>
            </div>
          </div>
          
          <Tabs value={selectedTab} onValueChange={(tab) => setSelectedTab(tab as any)} className="mt-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="cards">Cartas</TabsTrigger>
              <TabsTrigger value="sideboard">Sideboard</TabsTrigger>
              <TabsTrigger value="photos">Fotos</TabsTrigger>
              <TabsTrigger value="import-export">Import/Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cards">
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold">
                      {viewSideboard ? 'Sideboard' : 'Maindeck'}
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setViewSideboard(!viewSideboard)}
                    >
                      {viewSideboard ? 'Ver Maindeck' : 'Ver Sideboard'}
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const selectedCard = selectedDeck.cards.find(card => card.imageUrl);
                      if (selectedCard && selectedCard.imageUrl) {
                        handleSetCardAsBackground(selectedDeck.id, selectedCard.imageUrl);
                      }
                    }}
                    disabled={!selectedDeck.cards.some(card => card.imageUrl)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Seleccionar carta para portada
                  </Button>
                </div>
                
                {viewSideboard ? (
                  selectedDeck.sideboardCards && selectedDeck.sideboardCards.length > 0 ? (
                    <CardList 
                      cards={selectedDeck.sideboardCards} 
                      onCardSelect={selectCardForBackground} 
                      selectedCardUrl={selectedDeck.cardBackgroundUrl}
                    />
                  ) : (
                    <div className="text-center py-10 border border-dashed rounded-lg">
                      <p className="text-muted-foreground">No hay cartas en el sideboard</p>
                    </div>
                  )
                ) : (
                  <CardList 
                    cards={selectedDeck.cards} 
                    onCardSelect={selectCardForBackground} 
                    selectedCardUrl={selectedDeck.cardBackgroundUrl}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="sideboard">
              <div className="mt-6">
                <SideboardGuideComponent 
                  deckId={selectedDeck.id} 
                  initialGuide={selectedDeck.sideboardGuide}
                  onSave={handleSaveSideboardGuide}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="photos">
              <div className="mt-6">
                <DeckPhotoGallery 
                  deckId={selectedDeck.id}
                  initialPhotos={selectedDeck.photos}
                  onSave={handleSavePhotos}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="import-export">
              <div className="mt-6">
                <DeckImportExport 
                  deck={selectedDeck}
                  onImport={handleImportDeck}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Mazos</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsAddingDeck(true)} 
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" />
            Importar mazo
          </Button>
          <Button onClick={() => setIsAddingDeck(true)} className="shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Mazo
          </Button>
        </div>
      </div>
      
      {decks.length === 0 ? (
        <div className="text-center py-10 enhanced-card p-8">
          <p className="text-muted-foreground mb-4">Aún no tienes mazos creados</p>
          <div className="flex flex-col space-y-4 items-center">
            <Button onClick={() => setIsAddingDeck(true)} className="shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear tu primer mazo
            </Button>
            <DeckImportExport onImport={handleImportDeck} />
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {decks.map((deck) => (
              <div 
                key={deck.id} 
                onClick={() => handleSelectDeck(deck)}
                className="enhanced-card cursor-pointer h-full flex flex-col overflow-hidden"
              >
                {deck.cardBackgroundUrl ? (
                  <AspectRatio ratio={16/9} className="bg-gradient-to-b from-black/70 to-transparent relative">
                    <img 
                      src={deck.cardBackgroundUrl}
                      alt={deck.name}
                      className="object-cover w-full h-full opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
                  </AspectRatio>
                ) : null}
                
                <CardHeader className={deck.cardBackgroundUrl ? 'pt-3' : ''}>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {deck.name}
                  </CardTitle>
                  <CardDescription>
                    Formato: {deck.format}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p>{deck.cards.length} cartas</p>
                </CardContent>
                
                <CardFooter className="text-sm text-muted-foreground mt-auto">
                  Actualizado: {new Date(deck.updatedAt).toLocaleDateString()}
                </CardFooter>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Importar un mazo</h3>
            <DeckImportExport onImport={handleImportDeck} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckManager;
