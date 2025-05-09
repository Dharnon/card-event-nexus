import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserDecks, createDeck, updateDeck, deleteDeck } from '@/services/ProfileService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Deck, EventFormat, Card as MagicCard, SideboardGuide, DeckPhoto } from '@/types';
import { PlusCircle, ImageIcon, ChevronLeft, Trash, Edit, Upload } from 'lucide-react';
import DeckForm from './DeckForm';
import CardList from './CardList';
import SideboardGuideComponent from './SideboardGuide';
import DeckPhotoGallery from './DeckPhotoGallery';
import DeckImportExport from './DeckImportExport';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
const DeckManager = () => {
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [selectedTab, setSelectedTab] = useState<'cards' | 'sideboard' | 'photos' | 'import-export'>('cards');
  const [selectedCardAsBackground, setSelectedCardAsBackground] = useState<{
    [key: string]: string;
  }>({});
  const [viewSideboard, setViewSideboard] = useState(false);
  const queryClient = useQueryClient();
  const {
    toast
  } = useToast();
  const {
    data: decks = [],
    isLoading
  } = useQuery({
    queryKey: ['userDecks'],
    queryFn: () => getUserDecks()
  });
  const createDeckMutation = useMutation({
    mutationFn: createDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userDecks']
      });
      setIsAddingDeck(false);
    }
  });
  const updateDeckMutation = useMutation({
    mutationFn: ({
      deckId,
      updates
    }: {
      deckId: string;
      updates: Partial<Deck>;
    }) => updateDeck(deckId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userDecks']
      });
      setEditingDeck(null);
    }
  });
  const deleteDeckMutation = useMutation({
    mutationFn: deleteDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userDecks']
      });
      if (selectedDeck) setSelectedDeck(null);
    }
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
      }
    });
  };
  const handleSaveSideboardGuide = (guide: SideboardGuide) => {
    if (!selectedDeck) return;
    updateDeckMutation.mutate({
      deckId: selectedDeck.id,
      updates: {
        sideboardGuide: guide
      }
    });
  };
  const handleSavePhotos = (photos: DeckPhoto[]) => {
    if (!selectedDeck) return;
    updateDeckMutation.mutate({
      deckId: selectedDeck.id,
      updates: {
        photos: photos
      }
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
    name: string;
    format: string;
    cards: MagicCard[];
    sideboardCards?: MagicCard[];
  }) => {
    createDeckMutation.mutate({
      name: deckData.name,
      format: deckData.format as EventFormat,
      cards: deckData.cards,
      sideboardCards: deckData.sideboardCards
    });
    const sideboardMsg = deckData.sideboardCards?.length ? ` and ${deckData.sideboardCards.length} sideboard cards` : '';
    toast({
      title: "Deck imported",
      description: `Successfully imported ${deckData.name} with ${deckData.cards.length} maindeck cards${sideboardMsg}`
    });
  };
  if (isLoading) {
    return <div className="flex justify-center my-4">Loading decks...</div>;
  }
  if (isAddingDeck || editingDeck) {
    return <DeckForm deck={editingDeck} onSubmit={editingDeck ? (name, format, cards, cardBackgroundUrl) => handleUpdateDeck(editingDeck.id, name, format, cards, cardBackgroundUrl) : handleCreateDeck} onCancel={handleCancelForm} />;
  }
  if (selectedDeck) {
    return <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedDeck(null)} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to list
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setEditingDeck(selectedDeck)} size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteDeck(selectedDeck.id)} size="sm">
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
        
        <Card className="px-[20px]">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {selectedDeck.cardBackgroundUrl && <div className="md:w-1/4 w-full">
                  <AspectRatio ratio={488 / 680} className="rounded-lg overflow-hidden border">
                    <img src={selectedDeck.cardBackgroundUrl} alt="Deck Featured Card" className="w-full h-full object-cover" />
                  </AspectRatio>
                </div>}
              <div className={selectedDeck.cardBackgroundUrl ? "md:w-3/4 w-full" : "w-full"}>
                <CardTitle className="text-2xl">{selectedDeck.name}</CardTitle>
                <CardDescription className="mt-2">
                  <span className="inline-block bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                    {selectedDeck.format}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <Tabs value={selectedTab} onValueChange={tab => setSelectedTab(tab as any)} className="mt-4">
            <TabsList className="grid w-full max-w-md grid-cols-4 px-[7px]">
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="sideboard">Sideboard</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="import-export">Import/Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cards">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium">
                      {viewSideboard ? 'Sideboard' : 'Maindeck'}
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => setViewSideboard(!viewSideboard)}>
                      {viewSideboard ? 'View Maindeck' : 'View Sideboard'}
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                  const selectedCard = selectedDeck.cards.find(card => card.imageUrl);
                  if (selectedCard && selectedCard.imageUrl) {
                    handleSetCardAsBackground(selectedDeck.id, selectedCard.imageUrl);
                  }
                }} disabled={!selectedDeck.cards.some(card => card.imageUrl)}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Set card as cover
                  </Button>
                </div>
                
                {viewSideboard ? selectedDeck.sideboardCards && selectedDeck.sideboardCards.length > 0 ? <CardList cards={selectedDeck.sideboardCards} /> : <div className="text-center py-8 border border-dashed rounded-lg">
                      <p className="text-muted-foreground">No sideboard cards</p>
                    </div> : <CardList cards={selectedDeck.cards} />}
              </div>
            </TabsContent>
            
            <TabsContent value="sideboard">
              <div className="mt-4">
                <SideboardGuideComponent deckId={selectedDeck.id} initialGuide={selectedDeck.sideboardGuide} onSave={handleSaveSideboardGuide} />
              </div>
            </TabsContent>
            
            <TabsContent value="photos">
              <div className="mt-4">
                <DeckPhotoGallery deckId={selectedDeck.id} initialPhotos={selectedDeck.photos} onSave={handleSavePhotos} />
              </div>
            </TabsContent>
            
            <TabsContent value="import-export">
              <div className="mt-4">
                <DeckImportExport deck={selectedDeck} onImport={handleImportDeck} />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>;
  }
  return <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">My Decks</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddingDeck(true)} className="flex items-center gap-1" size="sm">
            <Upload className="h-4 w-4" />
            Import deck
          </Button>
          <Button onClick={() => setIsAddingDeck(true)} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Deck
          </Button>
        </div>
      </div>
      
      {decks.length === 0 ? <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">You don't have any decks yet</p>
          <div className="flex flex-col space-y-4 items-center">
            <Button onClick={() => setIsAddingDeck(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create your first deck
            </Button>
            <DeckImportExport onImport={handleImportDeck} />
          </div>
        </div> : <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {decks.map(deck => <Card key={deck.id} onClick={() => handleSelectDeck(deck)} className="cursor-pointer hover:border-primary/50 transition-colors">
                {deck.cardBackgroundUrl && <AspectRatio ratio={16 / 9}>
                    <div className="relative w-full h-full">
                      <img src={deck.cardBackgroundUrl} alt={deck.name} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                    </div>
                  </AspectRatio>}
                
                <CardHeader className={deck.cardBackgroundUrl ? 'pt-3' : ''}>
                  <CardTitle className="text-lg">{deck.name}</CardTitle>
                  <CardDescription>Format: {deck.format}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm">{deck.cards.length} cards</p>
                </CardContent>
                
                <CardFooter className="text-sm text-muted-foreground">
                  Updated: {new Date(deck.updatedAt).toLocaleDateString()}
                </CardFooter>
              </Card>)}
          </div>
          
          <Separator className="my-4" />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Import a deck</h3>
            <DeckImportExport onImport={handleImportDeck} />
          </div>
        </div>}
    </div>;
};
export default DeckManager;