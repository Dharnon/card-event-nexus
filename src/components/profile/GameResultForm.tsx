
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserDecks } from '@/services/ProfileService';
import { GameResult, EventFormat } from '@/types';

interface GameResultFormProps {
  eventId: string;
  onSubmit: (gameResult: Omit<GameResult, 'id'>) => void;
  onCancel: () => void;
}

const GameResultForm: React.FC<GameResultFormProps> = ({ eventId, onSubmit, onCancel }) => {
  const [win, setWin] = useState<boolean>(true);
  const [opponentDeckName, setOpponentDeckName] = useState('');
  const [opponentDeckFormat, setOpponentDeckFormat] = useState<EventFormat>('Standard');
  const [deckUsed, setDeckUsed] = useState('');
  const [notes, setNotes] = useState('');
  
  // Fetch user's decks for selection
  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['userDecks'],
    queryFn: () => getUserDecks(),
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponentDeckName.trim()) {
      alert('Por favor, introduce el nombre del mazo del oponente');
      return;
    }
    
    if (!deckUsed) {
      alert('Por favor, selecciona el mazo que usaste');
      return;
    }
    
    const gameResult: Omit<GameResult, 'id'> = {
      win,
      opponentDeckName,
      opponentDeckFormat,
      deckUsed,
      notes: notes.trim() || undefined,
      eventId,
      date: new Date().toISOString(),
    };
    
    onSubmit(gameResult);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="magic-card">
        <CardHeader>
          <CardTitle>Añadir Resultado de Partida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Resultado</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={win ? "default" : "outline"}
                className={win ? "bg-magic-green hover:bg-magic-green/90" : ""}
                onClick={() => setWin(true)}
              >
                Victoria
              </Button>
              <Button
                type="button"
                variant={!win ? "default" : "outline"}
                className={!win ? "bg-magic-red hover:bg-magic-red/90" : ""}
                onClick={() => setWin(false)}
              >
                Derrota
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="opponent-deck">Mazo del Oponente</Label>
            <Input 
              id="opponent-deck" 
              placeholder="Nombre del mazo"
              value={opponentDeckName}
              onChange={(e) => setOpponentDeckName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="opponent-format">Formato del Oponente</Label>
            <Select 
              value={opponentDeckFormat} 
              onValueChange={(value) => setOpponentDeckFormat(value as EventFormat)}
            >
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
          
          <div className="space-y-2">
            <Label htmlFor="deck-used">Tu Mazo</Label>
            <Select value={deckUsed} onValueChange={setDeckUsed}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu mazo" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="" disabled>Cargando mazos...</SelectItem>
                ) : decks.length === 0 ? (
                  <SelectItem value="" disabled>No tienes mazos</SelectItem>
                ) : (
                  decks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name} ({deck.format})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Notas sobre la partida..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar partida
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default GameResultForm;
