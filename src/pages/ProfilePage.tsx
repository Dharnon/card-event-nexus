
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeckManager from '@/components/profile/DeckManager';
import StatsDisplay from '@/components/profile/StatsDisplay';
import EventTracker from '@/components/profile/EventTracker';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("decks");

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil de Magic</h1>
            <p className="text-muted-foreground mt-1">
              Administra tus mazos, eventos y estadísticas de juego
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a la app
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="decks">Mazos</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="decks" className="mt-6">
            <DeckManager />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <StatsDisplay />
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <EventTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
