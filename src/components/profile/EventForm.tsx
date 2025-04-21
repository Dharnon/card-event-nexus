
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserEvent } from '@/types';

interface EventFormProps {
  event?: UserEvent | null;
  onSubmit: (name: string, date: string) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onCancel }) => {
  const [name, setName] = useState(event?.name || '');
  const [date, setDate] = useState(event ? 
    new Date(event.date).toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0]
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, introduce un nombre para el evento');
      return;
    }
    
    // Convert date to ISO string
    const dateTime = new Date(date);
    const isoDate = dateTime.toISOString();
    
    onSubmit(name, isoDate);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="magic-card">
        <CardHeader>
          <CardTitle>{event ? 'Editar Evento' : 'Nuevo Evento'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Nombre del Evento</Label>
            <Input 
              id="event-name" 
              placeholder="Nombre del evento"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="event-date">Fecha</Label>
            <Input 
              id="event-date" 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {event ? 'Guardar cambios' : 'Crear evento'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default EventForm;
