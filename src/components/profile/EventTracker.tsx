
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserEvents, createUserEvent, updateUserEvent, deleteUserEvent, createGameResult } from '@/services/ProfileService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, ChevronRight } from "lucide-react";
import { EventFormat, UserEvent, GameResult } from '@/types';
import EventForm from './EventForm';
import GameResultForm from './GameResultForm';

const EventTracker = () => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UserEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<UserEvent | null>(null);
  const [isAddingGame, setIsAddingGame] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch user events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['userEvents'],
    queryFn: () => getUserEvents(),
  });
  
  // Fetch game results for the selected event
  const { data: eventGames = [] } = useQuery({
    queryKey: ['eventGames', selectedEvent?.id],
    queryFn: () => {
      // This is a simplified version that doesn't actually fetch the games
      // In a real app, you'd fetch the games for the selected event
      return [];
    },
    enabled: !!selectedEvent,
  });
  
  // Create new event mutation
  const createEventMutation = useMutation({
    mutationFn: createUserEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      setIsAddingEvent(false);
    },
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, updates }: { eventId: string; updates: Partial<UserEvent> }) =>
      updateUserEvent(eventId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      queryClient.invalidateQueries({ queryKey: ['eventGames', selectedEvent?.id] });
      setEditingEvent(null);
    },
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: deleteUserEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      if (selectedEvent) setSelectedEvent(null);
    },
  });
  
  // Create game result mutation
  const createGameMutation = useMutation({
    mutationFn: createGameResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventGames', selectedEvent?.id] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      setIsAddingGame(false);
    },
  });
  
  // Handle form submission for new event
  const handleCreateEvent = (name: string, date: string) => {
    createEventMutation.mutate({
      name,
      date,
      games: [],
    });
  };
  
  // Handle form submission for updating event
  const handleUpdateEvent = (eventId: string, name: string, date: string) => {
    updateEventMutation.mutate({
      eventId,
      updates: {
        name,
        date,
      },
    });
  };
  
  // Handle event deletion
  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      deleteEventMutation.mutate(eventId);
    }
  };
  
  // Handle adding a game result
  const handleAddGameResult = (gameResult: Omit<GameResult, 'id'>) => {
    createGameMutation.mutate(gameResult);
  };
  
  // Select an event to view details
  const handleSelectEvent = (event: UserEvent) => {
    setSelectedEvent(event);
    setIsAddingEvent(false);
    setEditingEvent(null);
  };
  
  // Cancel form
  const handleCancelForm = () => {
    setIsAddingEvent(false);
    setEditingEvent(null);
    setIsAddingGame(false);
  };
  
  if (isLoading) {
    return <div className="flex justify-center my-8">Cargando eventos...</div>;
  }
  
  // Show event form (create or edit)
  if (isAddingEvent || editingEvent) {
    return (
      <EventForm 
        event={editingEvent}
        onSubmit={editingEvent 
          ? (name, date) => handleUpdateEvent(editingEvent.id, name, date) 
          : handleCreateEvent
        }
        onCancel={handleCancelForm}
      />
    );
  }
  
  // Show game result form
  if (isAddingGame && selectedEvent) {
    return (
      <GameResultForm 
        eventId={selectedEvent.id}
        onSubmit={handleAddGameResult}
        onCancel={handleCancelForm}
      />
    );
  }
  
  // Show selected event details
  if (selectedEvent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedEvent(null)}>
            Volver a la lista
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setEditingEvent(selectedEvent)}>
              Editar evento
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteEvent(selectedEvent.id)}
            >
              Eliminar evento
            </Button>
          </div>
        </div>
        
        <div className="magic-card p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedEvent.name}</h2>
              <p className="text-muted-foreground">
                {new Date(selectedEvent.date).toLocaleDateString()}
              </p>
            </div>
            <Button onClick={() => setIsAddingGame(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir partida
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Partidas</h3>
            
            {eventGames.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-muted/30">
                <p className="text-muted-foreground mb-4">Aún no hay partidas en este evento</p>
                <Button onClick={() => setIsAddingGame(true)}>
                  Añadir primera partida
                </Button>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Resultado</th>
                      <th className="text-left p-3">Oponente</th>
                      <th className="text-left p-3">Mazo utilizado</th>
                      <th className="text-left p-3">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventGames.map((game) => (
                      <tr key={game.id} className="border-t">
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            game.win ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {game.win ? 'Victoria' : 'Derrota'}
                          </span>
                        </td>
                        <td className="p-3">{game.opponentDeckName}</td>
                        <td className="p-3">{game.deckUsed}</td>
                        <td className="p-3">{game.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Show event list
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Eventos</h2>
        <Button onClick={() => setIsAddingEvent(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>
      
      {events.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Aún no tienes eventos creados</p>
          <Button onClick={() => setIsAddingEvent(true)}>
            Crear tu primer evento
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="magic-card magic-card-hover cursor-pointer"
              onClick={() => handleSelectEvent(event)}
            >
              <div className="flex items-center p-4">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{event.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventTracker;
