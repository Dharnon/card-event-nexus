
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserEvents, createUserEvent, updateUserEvent, deleteUserEvent, createGameResult, getUserGames, getUserDecks } from '@/services/ProfileService';
import { UserEvent, GameResult } from '@/types';
import { toast } from "sonner";
import EventForm from './EventForm';
import GameResultForm from './GameResultForm';
import EventList from './event-tracker/EventList';
import EventDetails from './event-tracker/EventDetails';

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
  
  // Fetch game results for all events
  const { data: allGames = [] } = useQuery({
    queryKey: ['userGames'],
    queryFn: () => getUserGames(),
  });
  
  // Fetch user decks for displaying deck names
  const { data: decks = [] } = useQuery({
    queryKey: ['userDecks'],
    queryFn: () => getUserDecks(),
  });
  
  // Filter games for the selected event
  const eventGames = selectedEvent 
    ? allGames.filter(game => game.eventId === selectedEvent.id)
    : [];
  
  // Create new event mutation
  const createEventMutation = useMutation({
    mutationFn: createUserEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      setIsAddingEvent(false);
      toast.success("Evento creado con éxito");
    },
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, updates }: { eventId: string; updates: Partial<UserEvent> }) =>
      updateUserEvent(eventId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      setEditingEvent(null);
      toast.success("Evento actualizado con éxito");
    },
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: deleteUserEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      if (selectedEvent) setSelectedEvent(null);
      toast.success("Evento eliminado con éxito");
    },
  });
  
  // Create game result mutation
  const createGameMutation = useMutation({
    mutationFn: createGameResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGames'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      setIsAddingGame(false);
      toast.success("Resultado de partida guardado con éxito");
    },
  });
  
  // Handler functions
  const handleCreateEvent = (name: string, date: string) => {
    createEventMutation.mutate({
      name,
      date,
      games: [],
    });
  };
  
  const handleUpdateEvent = (eventId: string, name: string, date: string) => {
    updateEventMutation.mutate({
      eventId,
      updates: { name, date },
    });
  };
  
  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      deleteEventMutation.mutate(eventId);
    }
  };
  
  const handleAddGameResult = (gameResult: Omit<GameResult, 'id'>) => {
    createGameMutation.mutate(gameResult);
  };
  
  const handleSelectEvent = (event: UserEvent) => {
    setSelectedEvent(event);
    setIsAddingEvent(false);
    setEditingEvent(null);
  };
  
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
      <EventDetails
        selectedEvent={selectedEvent}
        eventGames={eventGames}
        decks={decks}
        onBack={() => setSelectedEvent(null)}
        onEdit={setEditingEvent}
        onDelete={handleDeleteEvent}
        onAddGame={() => setIsAddingGame(true)}
      />
    );
  }
  
  // Show event list
  return (
    <EventList
      events={events}
      onAddEvent={() => setIsAddingEvent(true)}
      onSelectEvent={handleSelectEvent}
    />
  );
};

export default EventTracker;
