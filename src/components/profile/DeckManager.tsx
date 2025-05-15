import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserDecks, createDeck, updateDeck, deleteDeck } from '@/services/ProfileService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Deck, EventFormat, Card as MagicCard, SideboardGuide, DeckPhoto } from '@/types';
import { PlusCircle, ImageIcon, ChevronLeft, Trash, Edit, Upload, Download, File } from 'lucide-react';
import DeckForm from './DeckForm';
import CardList from './CardList';
import SideboardGuideComponent from './SideboardGuide';
import DeckPhotoGallery from './DeckPhotoGallery';
import DeckImportExport from './DeckImportExport';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

const DeckManager = () => {
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [selectedTab, setSelectedTab] = useState<'cards' | 'sideboard' | 'photos' | 'import-export'>('cards');
  const [selectedCardAsBackground, setSelectedCardAsBackground] = useState<{
    [key: string]: string;
  }>({});
  const [viewSideboard, setViewSideboard] = useState(false);
  const isMobile = useIsMobile();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
      toast({
        title: "Success",
        description: "Deck created successfully"
      });
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
      toast({
        title: "Success",
        description: "Deck updated successfully"
      });
    }
  });
  
  const deleteDeckMutation = useMutation({
    mutationFn: deleteDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userDecks']
      });
      if (selectedDeck) setSelectedDeck(null);
      toast({
        title: "Success",
        description: "Deck deleted successfully"
      });
    }
  });
  
  const handleCreateDeck = (name: string, format: EventFormat, cards: MagicCard[], sideboardCards: MagicCard[], cardBackgroundUrl?: string) => {
    createDeckMutation.mutate({
      name,
      format,
      cards,
      sideboardCards,
      cardBackgroundUrl
    });
  };
  
  const handleUpdateDeck = (deckId: string, name: string, format: EventFormat, cards: MagicCard[], sideboardCards: MagicCard[], cardBackgroundUrl?: string) => {
    updateDeckMutation.mutate({
      deckId,
      updates: {
        name,
        format,
        cards,
        sideboardCards,
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
    if (window.confirm('Are you sure you want to delete this deck?')) {
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
      sideboardCards: deckData.sideboardCards || []
    });
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-magic-purple border-t-transparent rounded-full"></div>
    </div>;
  }
  
  if (isAddingDeck || editingDeck) {
    return <DeckForm 
      deck={editingDeck} 
      onSubmit={editingDeck 
        ? (name, format, cards, sideboardCards, cardBackgroundUrl) => 
            handleUpdateDeck(editingDeck.id, name, format, cards, sideboardCards, cardBackgroundUrl) 
        : handleCreateDeck
      } 
      onCancel={handleCancelForm} 
    />;
  }
  
  if (selectedDeck) {
    return (
      <div className="space-y-4">
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
        
        <Card className="bg-black/60 border-magic-purple/30">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {selectedDeck.cardBackgroundUrl && (
                <div className="md:w-1/4 w-full">
                  <AspectRatio ratio={488/680} className="rounded-lg overflow-hidden border border-magic-purple/40">
                    <img 
                      src={selectedDeck.cardBackgroundUrl} 
                      alt="Deck Featured Card" 
                      className="w-full h-full object-cover" 
                    />
                  </AspectRatio>
                </div>
              )}
              <div className={selectedDeck.cardBackgroundUrl ? "md:w-3/4 w-full" : "w-full"}>
                <CardTitle className="text-2xl text-magic-lightPurple">{selectedDeck.name}</CardTitle>
                <CardDescription className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-magic-purple/40 bg-black/40">{selectedDeck.format}</Badge>
                  <Badge variant="secondary" className="bg-magic-purple/20 text-magic-lightPurple">{selectedDeck.cards.reduce((sum, card) => sum + card.quantity, 0)} main deck cards</Badge>
                  {selectedDeck.sideboardCards && selectedDeck.sideboardCards.length > 0 && (
                    <Badge variant="secondary" className="bg-magic-purple/20 text-magic-lightPurple">{selectedDeck.sideboardCards.reduce((sum, card) => sum + card.quantity, 0)} sideboard cards</Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <Tabs value={selectedTab} onValueChange={tab => setSelectedTab(tab as any)} className="mt-4">
            <TabsList className="grid w-full max-w-md grid-cols-4 bg-black/70 border border-magic-purple/30">
              <TabsTrigger 
                value="cards"
                className="data-[state=active]:bg-magic-purple data-[state=active]:text-white"
              >
                Cards
              </TabsTrigger>
              <TabsTrigger 
                value="sideboard"
                className="data-[state=active]:bg-magic-purple data-[state=active]:text-white"
              >
                Sideboard
              </TabsTrigger>
              <TabsTrigger 
                value="photos"
                className="data-[state=active]:bg-magic-purple data-[state=active]:text-white"
              >
                Photos
              </TabsTrigger>
              <TabsTrigger 
                value="import-export"
                className="data-[state=active]:bg-magic-purple data-[state=active]:text-white"
              >
                Import/Export
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cards">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium text-magic-lightPurple">
                      {viewSideboard ? 'Sideboard' : 'Maindeck'}
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setViewSideboard(!viewSideboard)}
                      className="border-magic-purple/30 hover:bg-magic-purple/10"
                    >
                      {viewSideboard ? 'View Maindeck' : 'View Sideboard'}
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const cards = viewSideboard ? selectedDeck.sideboardCards : selectedDeck.cards;
                      const selectedCard = cards?.find(card => card.imageUrl);
                      if (selectedCard && selectedCard.imageUrl) {
                        handleSetCardAsBackground(selectedDeck.id, selectedCard.imageUrl);
                      }
                    }} 
                    disabled={
                      viewSideboard 
                        ? !selectedDeck.sideboardCards?.some(card => card.imageUrl) 
                        : !selectedDeck.cards.some(card => card.imageUrl)
                    }
                    className="border-magic-purple/30 hover:bg-magic-purple/10"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Set card as cover
                  </Button>
                </div>
                
                {viewSideboard ? (
                  selectedDeck.sideboardCards && selectedDeck.sideboardCards.length > 0 ? (
                    <CardList cards={selectedDeck.sideboardCards} />
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-lg border-magic-purple/30 bg-black/30">
                      <p className="text-muted-foreground">No sideboard cards</p>
                    </div>
                  )
                ) : (
                  <CardList cards={selectedDeck.cards} />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="sideboard">
              <div className="mt-4">
                <SideboardGuideComponent 
                  deckId={selectedDeck.id} 
                  initialGuide={selectedDeck.sideboardGuide} 
                  onSave={handleSaveSideboardGuide} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="photos">
              <div className="mt-4">
                <DeckPhotoGallery 
                  deckId={selectedDeck.id} 
                  initialPhotos={selectedDeck.photos} 
                  onSave={handleSavePhotos} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="import-export">
              <div className="mt-4">
                <DeckImportExport deck={selectedDeck} onImport={handleImportDeck} />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-medium text-magic-lightPurple">My Decks</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAddingDeck(false);
              setSelectedTab('import-export');
            }} 
            className="flex items-center gap-1 border-magic-purple/30 hover:bg-magic-purple/20" 
            size="sm"
          >
            <Upload className="h-4 w-4" />
            Import deck
          </Button>
          <Button 
            onClick={() => setIsAddingDeck(true)} 
            size="sm"
            className="bg-magic-purple hover:bg-magic-purple/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Deck
          </Button>
        </div>
      </div>
      
      {decks.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg border-magic-purple/30 bg-black/30">
          <p className="text-muted-foreground mb-4">You don't have any decks yet</p>
          <div className="flex flex-col space-y-4 items-center">
            <Button 
              onClick={() => setIsAddingDeck(true)}
              className="bg-magic-purple hover:bg-magic-purple/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create your first deck
            </Button>
            <DeckImportExport onImport={handleImportDeck} />
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {decks.map(deck => (
              <Card 
                key={deck.id} 
                onClick={() => handleSelectDeck(deck)} 
                className="cursor-pointer transition-all duration-300 overflow-hidden bg-black/60 hover:bg-black/70 border-magic-purple/30 hover:border-magic-purple/60"
              >
                <AspectRatio ratio={16/9}>
                  <div className="relative w-full h-full">
                    {deck.cardBackgroundUrl ? (
                      <img 
                        src={deck.cardBackgroundUrl} 
                        alt={deck.name} 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://c2.scryfall.com/file/scryfall-card-backs/normal/59/597b79b3-7d77-4261-871a-60dd17403388.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/30">
                        <File className="h-12 w-12 text-magic-purple/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />
                  </div>
                </AspectRatio>
                
                <CardHeader className="pt-0 pb-2">
                  <CardTitle className="text-lg text-magic-lightPurple">{deck.name}</CardTitle>
                  <CardDescription className="text-gray-400">Format: {deck.format}</CardDescription>
                </CardHeader>
                
                <CardContent className="py-0">
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className="bg-magic-purple/20 border-magic-purple/30 text-magic-lightPurple"
                    >
                      {deck.cards.reduce((sum, card) => sum + card.quantity, 0)} cards
                    </Badge>
                    {deck.sideboardCards && deck.sideboardCards.length > 0 && (
                      <Badge 
                        variant="outline"
                        className="bg-black/40 border-magic-purple/20 text-magic-lightPurple/80"
                      >
                        {deck.sideboardCards.reduce((sum, card) => sum + card.quantity, 0)} sideboard
                      </Badge>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="text-sm text-muted-foreground pt-2 pb-3">
                  Updated: {new Date(deck.updatedAt).toLocaleDateString()}
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Separator className="my-4 bg-magic-purple/20" />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2 text-magic-lightPurple">Import a deck</h3>
            <DeckImportExport onImport={handleImportDeck} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckManager;
