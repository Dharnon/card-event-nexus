import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SideboardGuide as SideboardGuideType, Matchup, Card as MagicCard } from '@/types';
import { Edit, Eye, FileText, Trash } from 'lucide-react';
import CardSearchInput from './CardSearchInput';
interface SideboardGuideProps {
  deckId: string;
  initialGuide?: SideboardGuideType;
  onSave: (guide: SideboardGuideType) => void;
}
const SideboardGuideComponent: React.FC<SideboardGuideProps> = ({
  deckId,
  initialGuide,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(!initialGuide);
  const [guide, setGuide] = useState<SideboardGuideType>(initialGuide || {
    id: `guide-${Date.now()}`,
    deckId,
    mainNotes: '',
    matchups: []
  });
  const [activeMatchup, setActiveMatchup] = useState<string | null>(guide.matchups.length > 0 ? guide.matchups[0].id : null);
  const [newMatchupName, setNewMatchupName] = useState('');
  const handleSave = () => {
    onSave(guide);
    setIsEditing(false);
  };
  const addMatchup = () => {
    if (!newMatchupName.trim()) return;
    const newMatchup: Matchup = {
      id: `matchup-${Date.now()}`,
      name: newMatchupName,
      strategy: '',
      cardsToSideIn: [],
      cardsToSideOut: []
    };
    setGuide(prev => ({
      ...prev,
      matchups: [...prev.matchups, newMatchup]
    }));
    setActiveMatchup(newMatchup.id);
    setNewMatchupName('');
  };
  const removeMatchup = (matchupId: string) => {
    setGuide(prev => ({
      ...prev,
      matchups: prev.matchups.filter(m => m.id !== matchupId)
    }));
    if (activeMatchup === matchupId) {
      const remainingMatchups = guide.matchups.filter(m => m.id !== matchupId);
      setActiveMatchup(remainingMatchups.length > 0 ? remainingMatchups[0].id : null);
    }
  };
  const updateMatchup = (matchupId: string, updates: Partial<Matchup>) => {
    setGuide(prev => ({
      ...prev,
      matchups: prev.matchups.map(m => m.id === matchupId ? {
        ...m,
        ...updates
      } : m)
    }));
  };
  const addCardToMatchup = (matchupId: string, card: MagicCard, isSideIn: boolean) => {
    setGuide(prev => ({
      ...prev,
      matchups: prev.matchups.map(m => {
        if (m.id !== matchupId) return m;
        if (isSideIn) {
          return {
            ...m,
            cardsToSideIn: [...m.cardsToSideIn, card]
          };
        } else {
          return {
            ...m,
            cardsToSideOut: [...m.cardsToSideOut, card]
          };
        }
      })
    }));
  };
  const removeCardFromMatchup = (matchupId: string, cardId: string, isSideIn: boolean) => {
    setGuide(prev => ({
      ...prev,
      matchups: prev.matchups.map(m => {
        if (m.id !== matchupId) return m;
        if (isSideIn) {
          return {
            ...m,
            cardsToSideIn: m.cardsToSideIn.filter(c => c.id !== cardId)
          };
        } else {
          return {
            ...m,
            cardsToSideOut: m.cardsToSideOut.filter(c => c.id !== cardId)
          };
        }
      })
    }));
  };
  const currentMatchup = guide.matchups.find(m => m.id === activeMatchup);
  return <div className="space-y-6 mx-[41px]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Guía de Sideboard
        </h2>
        <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <Eye className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
          {isEditing ? "Ver guía" : "Editar guía"}
        </Button>
      </div>
      
      {isEditing ? <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notas generales</CardTitle>
              <CardDescription>
                Información general sobre la estrategia del mazo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={guide.mainNotes} onChange={e => setGuide(prev => ({
            ...prev,
            mainNotes: e.target.value
          }))} placeholder="Escribe notas generales sobre tu mazo y su estrategia..." rows={5} />
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Matchups</h3>
              <div className="flex space-x-2">
                <Input placeholder="Nombre del matchup" value={newMatchupName} onChange={e => setNewMatchupName(e.target.value)} className="w-48" />
                <Button onClick={addMatchup}>Añadir</Button>
              </div>
            </div>
            
            {guide.matchups.length > 0 ? <Tabs value={activeMatchup || ''} onValueChange={setActiveMatchup} className="w-full">
                <TabsList className="w-full flex overflow-x-auto">
                  {guide.matchups.map(matchup => <TabsTrigger key={matchup.id} value={matchup.id} className="flex-shrink-0">
                      {matchup.name}
                    </TabsTrigger>)}
                </TabsList>
                
                {guide.matchups.map(matchup => <TabsContent key={matchup.id} value={matchup.id} className="mt-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle>{matchup.name}</CardTitle>
                          <CardDescription>Estrategia para este matchup</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeMatchup(matchup.id)} className="text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Estrategia</Label>
                          <Textarea value={matchup.strategy} onChange={e => updateMatchup(matchup.id, {
                    strategy: e.target.value
                  })} placeholder="Describe tu estrategia para este matchup..." rows={3} />
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Cartas para meter</Label>
                            <div className="space-y-4">
                              <CardSearchInput onCardSelect={card => addCardToMatchup(matchup.id, card, true)} placeholder="Buscar carta para meter..." />
                              
                              <div className="border rounded-md p-3 space-y-2 min-h-[100px]">
                                {matchup.cardsToSideIn.length === 0 ? <p className="text-sm text-muted-foreground">No hay cartas seleccionadas</p> : matchup.cardsToSideIn.map(card => <div key={card.id} className="flex justify-between items-center">
                                      <span>{card.name}</span>
                                      <Button variant="ghost" size="sm" onClick={() => removeCardFromMatchup(matchup.id, card.id, true)} className="h-6 w-6 p-0">
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Cartas para sacar</Label>
                            <div className="space-y-4">
                              <CardSearchInput onCardSelect={card => addCardToMatchup(matchup.id, card, false)} placeholder="Buscar carta para sacar..." />
                              
                              <div className="border rounded-md p-3 space-y-2 min-h-[100px]">
                                {matchup.cardsToSideOut.length === 0 ? <p className="text-sm text-muted-foreground">No hay cartas seleccionadas</p> : matchup.cardsToSideOut.map(card => <div key={card.id} className="flex justify-between items-center">
                                      <span>{card.name}</span>
                                      <Button variant="ghost" size="sm" onClick={() => removeCardFromMatchup(matchup.id, card.id, false)} className="h-6 w-6 p-0">
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>)}
              </Tabs> : <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground mb-2">No hay matchups añadidos</p>
                <p className="text-sm text-muted-foreground">
                  Usa el formulario de arriba para añadir tu primer matchup
                </p>
              </div>}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>Guardar guía de sideboard</Button>
          </div>
        </div> : <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notas generales</CardTitle>
            </CardHeader>
            <CardContent>
              {guide.mainNotes ? <div className="whitespace-pre-line">{guide.mainNotes}</div> : <p className="text-muted-foreground">No hay notas generales</p>}
            </CardContent>
          </Card>
          
          {guide.matchups.length > 0 ? <div className="space-y-4">
              <h3 className="text-xl font-semibold">Matchups</h3>
              
              <Tabs value={activeMatchup || ''} onValueChange={setActiveMatchup} className="w-full">
                <TabsList className="w-full flex overflow-x-auto">
                  {guide.matchups.map(matchup => <TabsTrigger key={matchup.id} value={matchup.id} className="flex-shrink-0">
                      {matchup.name}
                    </TabsTrigger>)}
                </TabsList>
                
                {guide.matchups.map(matchup => <TabsContent key={matchup.id} value={matchup.id} className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{matchup.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Estrategia</h4>
                          {matchup.strategy ? <div className="whitespace-pre-line">{matchup.strategy}</div> : <p className="text-muted-foreground">No hay estrategia definida</p>}
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-2">Cartas para meter</h4>
                            {matchup.cardsToSideIn.length === 0 ? <p className="text-muted-foreground">No hay cartas seleccionadas</p> : <ul className="list-disc pl-5 space-y-1">
                                {matchup.cardsToSideIn.map(card => <li key={card.id}>{card.name}</li>)}
                              </ul>}
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Cartas para sacar</h4>
                            {matchup.cardsToSideOut.length === 0 ? <p className="text-muted-foreground">No hay cartas seleccionadas</p> : <ul className="list-disc pl-5 space-y-1">
                                {matchup.cardsToSideOut.map(card => <li key={card.id}>{card.name}</li>)}
                              </ul>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>)}
              </Tabs>
            </div> : <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground">No hay matchups añadidos</p>
              <Button variant="outline" onClick={() => setIsEditing(true)} className="mt-2">
                <Edit className="mr-2 h-4 w-4" />
                Editar guía
              </Button>
            </div>}
        </div>}
    </div>;
};
export default SideboardGuideComponent;