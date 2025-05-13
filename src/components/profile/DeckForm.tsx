
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Deck, EventFormat, Card as MagicCard } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CardSearchInput from './CardSearchInput';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ImageIcon, X, Plus, Trash } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/use-toast';

interface DeckFormProps {
  deck?: Deck | null;
  onSubmit: (name: string, format: EventFormat, cards: MagicCard[], sideboardCards: MagicCard[], cardBackgroundUrl?: string) => void;
  onCancel: () => void;
}

const DeckForm: React.FC<DeckFormProps> = ({ deck, onSubmit, onCancel }) => {
  const [name, setName] = useState(deck?.name || '');
  const [format, setFormat] = useState<EventFormat>(deck?.format || 'Standard');
  const [cards, setCards] = useState<MagicCard[]>(deck?.cards || []);
  const [sideboardCards, setSideboardCards] = useState<MagicCard[]>(deck?.sideboardCards || []);
  const [cardBackgroundUrl, setCardBackgroundUrl] = useState<string | undefined>(deck?.cardBackgroundUrl);
  const [selectedCardForBackground, setSelectedCardForBackground] = useState<MagicCard | null>(null);
  const [activeTab, setActiveTab] = useState<"maindeck" | "sideboard">("maindeck");
  
  useEffect(() => {
    if (cardBackgroundUrl) {
      const mainDeckMatch = cards.find(card => card.imageUrl === cardBackgroundUrl);
      const sideboardMatch = sideboardCards.find(card => card.imageUrl === cardBackgroundUrl);
      
      if (mainDeckMatch) {
        setSelectedCardForBackground(mainDeckMatch);
      } else if (sideboardMatch) {
        setSelectedCardForBackground(sideboardMatch);
      }
    }
  }, [cards, sideboardCards, cardBackgroundUrl]);
  
  const handleAddCard = (newCard: MagicCard) => {
    if (activeTab === "maindeck") {
      // Check if card already exists in maindeck
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
    } else {
      // Check if card already exists in sideboard
      const existingSideboardCard = sideboardCards.find(card => 
        card.name.toLowerCase() === newCard.name.toLowerCase()
      );
      
      if (existingSideboardCard) {
        // Update quantity if card exists
        const updatedSideboard = sideboardCards.map(card => 
          card.name.toLowerCase() === newCard.name.toLowerCase() 
            ? { ...card, quantity: card.quantity + newCard.quantity }
            : card
        );
        setSideboardCards(updatedSideboard);
      } else {
        // Add new card
        setSideboardCards([...sideboardCards, newCard]);
        
        // If this is the first card with an image and no background is selected yet, use it
        if (!cardBackgroundUrl && newCard.imageUrl) {
          setCardBackgroundUrl(newCard.imageUrl);
          setSelectedCardForBackground(newCard);
        }
      }
    }
  };
  
  const handleRemoveCard = (cardId: string, isMaindeck: boolean) => {
    if (isMaindeck) {
      const cardToRemove = cards.find(card => card.id === cardId);
      setCards(cards.filter(card => card.id !== cardId));
      
      // If removed card was the background, reset background
      if (cardToRemove?.imageUrl === cardBackgroundUrl) {
        setCardBackgroundUrl(undefined);
        setSelectedCardForBackground(null);
      }
    } else {
      const cardToRemove = sideboardCards.find(card => card.id === cardId);
      setSideboardCards(sideboardCards.filter(card => card.id !== cardId));
      
      // If removed card was the background, reset background
      if (cardToRemove?.imageUrl === cardBackgroundUrl) {
        setCardBackgroundUrl(undefined);
        setSelectedCardForBackground(null);
      }
    }
  };
  
  const handleUpdateCardQuantity = (cardId: string, newQuantity: number, isMaindeck: boolean) => {
    if (newQuantity <= 0) {
      handleRemoveCard(cardId, isMaindeck);
      return;
    }
    
    if (isMaindeck) {
      setCards(cards.map(card => 
        card.id === cardId ? { ...card, quantity: newQuantity } : card
      ));
    } else {
      setSideboardCards(sideboardCards.map(card => 
        card.id === cardId ? { ...card, quantity: newQuantity } : card
      ));
    }
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
      toast({
        title: "Form error",
        description: "Please enter a name for your deck",
        variant: "destructive"
      });
      return;
    }
    
    if (cards.length === 0) {
      toast({
        title: "Form error",
        description: "Please add at least one card to your deck",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(name, format, cards, sideboardCards, cardBackgroundUrl);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle>{deck ? 'Edit Deck' : 'New Deck'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="space-y-4 md:w-2/3">
              <div className="space-y-2">
                <Label htmlFor="deck-name">Deck Name</Label>
                <Input 
                  id="deck-name" 
                  placeholder="Deck name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deck-format">Format</Label>
                <Select value={format} onValueChange={(value) => setFormat(value as EventFormat)}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Select a format" />
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
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Card Background Preview */}
            <div className="md:w-1/3 space-y-2">
              <Label>Featured Card</Label>
              
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
                    <p className="text-sm text-muted-foreground">Select a card to feature</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "maindeck" | "sideboard")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="maindeck">Maindeck ({cards.reduce((sum, card) => sum + card.quantity, 0)} cards)</TabsTrigger>
                <TabsTrigger value="sideboard">Sideboard ({sideboardCards.reduce((sum, card) => sum + card.quantity, 0)} cards)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="maindeck" className="mt-0">
                <div className="mb-4">
                  <CardSearchInput onCardSelect={handleAddCard} placeholder="Search for a card..." />
                </div>
                
                {cards.length > 0 && (
                  <div className="border rounded-md bg-background/50 border-border/50">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2">Qty</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-center p-2">Cover</th>
                          <th className="text-right p-2">Actions</th>
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
                                  onClick={() => handleUpdateCardQuantity(card.id, card.quantity - 1, true)}
                                >
                                  -
                                </Button>
                                <span className="mx-2">{card.quantity}</span>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleUpdateCardQuantity(card.id, card.quantity + 1, true)}
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
                                  {card.imageUrl === cardBackgroundUrl ? 'Selected' : 'Select'}
                                </Button>
                              )}
                            </td>
                            <td className="p-2 text-right">
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveCard(card.id, true)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sideboard" className="mt-0">
                <div className="mb-4">
                  <CardSearchInput onCardSelect={handleAddCard} placeholder="Search for a sideboard card..." />
                </div>
                
                {sideboardCards.length > 0 ? (
                  <div className="border rounded-md bg-background/50 border-border/50">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2">Qty</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-center p-2">Cover</th>
                          <th className="text-right p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sideboardCards.map((card) => (
                          <tr key={card.id} className={`border-t hover:bg-muted/30 transition-colors ${card.imageUrl === cardBackgroundUrl ? 'bg-primary/5' : ''}`}>
                            <td className="p-2">
                              <div className="flex items-center">
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleUpdateCardQuantity(card.id, card.quantity - 1, false)}
                                >
                                  -
                                </Button>
                                <span className="mx-2">{card.quantity}</span>
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleUpdateCardQuantity(card.id, card.quantity + 1, false)}
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
                                  {card.imageUrl === cardBackgroundUrl ? 'Selected' : 'Select'}
                                </Button>
                              )}
                            </td>
                            <td className="p-2 text-right">
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveCard(card.id, false)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-md p-8 text-center">
                    <p className="text-muted-foreground mb-4">No sideboard cards yet</p>
                    <p className="text-sm text-muted-foreground">
                      Search and add cards for your sideboard above
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {deck ? 'Save Changes' : 'Create Deck'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default DeckForm;
