import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserDecks } from '@/services/ProfileService';
import { GameResult, EventFormat, MatchScore } from '@/types';
import { Trophy } from "lucide-react";
import GameLifeTracker from './GameLifeTracker';
import { useToast } from "@/hooks/use-toast";

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
  const [playerWins, setPlayerWins] = useState<number>(2);
  const [opponentWins, setOpponentWins] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['userDecks'],
    queryFn: () => getUserDecks(),
  });
  
  const updateWinState = (playerW: number, opponentW: number) => {
    setPlayerWins(playerW);
    setOpponentWins(opponentW);
    setWin(playerW > opponentW);
  };
  
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
    
    const matchScore: MatchScore = {
      playerWins,
      opponentWins
    };
    
    const gameResult: Omit<GameResult, 'id'> = {
      win: playerWins > opponentWins,
      opponentDeckName,
      opponentDeckFormat,
      deckUsed,
      notes: notes.trim() || undefined,
      eventId,
      date: new Date().toISOString(),
      matchScore
    };
    
    onSubmit(gameResult);
  };
  
  const { toast } = useToast();

  const handleStartGame = () => {
    if (!deckUsed) {
      toast({
        title: "Selecciona un mazo",
        description: "Debes seleccionar un mazo antes de comenzar la partida",
        variant: "destructive",
      });
      return;
    }
    setIsPlaying(true);
  };

  if (isPlaying) {
    return (
      <div className="space-y-6">
        <GameLifeTracker 
          deckId={deckUsed}
          onGameEnd={() => setIsPlaying(false)}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="magic-card">
        <CardHeader>
          <CardTitle>Añadir Resultado de Partida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deck-used">Tu Mazo</Label>
            <Select value={deckUsed} onValueChange={setDeckUsed}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu mazo" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Cargando mazos...</SelectItem>
                ) : decks.length === 0 ? (
                  <SelectItem value="no-decks" disabled>No tienes mazos</SelectItem>
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
            <Label>Resultado del Match (Mejor de 3)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={playerWins === 2 && opponentWins === 0 ? "default" : "outline"}
                className={playerWins === 2 && opponentWins === 0 ? "bg-magic-green hover:bg-magic-green/90" : ""}
                onClick={() => updateWinState(2, 0)}
              >
                2-0
              </Button>
              <Button
                type="button"
                variant={playerWins === 2 && opponentWins === 1 ? "default" : "outline"}
                className={playerWins === 2 && opponentWins === 1 ? "bg-magic-green hover:bg-magic-green/90" : ""}
                onClick={() => updateWinState(2, 1)}
              >
                2-1
              </Button>
              <Button
                type="button"
                variant={playerWins === 1 && opponentWins === 2 ? "default" : "outline"}
                className={playerWins === 1 && opponentWins === 2 ? "bg-magic-red hover:bg-magic-red/90" : ""}
                onClick={() => updateWinState(1, 2)}
              >
                1-2
              </Button>
              <Button
                type="button"
                variant={playerWins === 0 && opponentWins === 2 ? "default" : "outline"}
                className={`${playerWins === 0 && opponentWins === 2 ? "bg-magic-red hover:bg-magic-red/90" : ""} col-span-3`}
                onClick={() => updateWinState(0, 2)}
              >
                0-2
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
          <div className="space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleStartGame}
            >
              Comenzar Partida
            </Button>
            <Button type="submit">
              Guardar partida
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
};

export default GameResultForm;
