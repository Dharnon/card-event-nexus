
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeckManager from '@/components/profile/DeckManager';
import StatsDisplay from '@/components/profile/StatsDisplay';
import EventTracker from '@/components/profile/EventTracker';
import { useNavigate } from 'react-router-dom';

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
          
          <div className="flex items-center space-x-4">
            <div className="rounded-full w-12 h-12 bg-primary flex items-center justify-center text-white text-lg font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>
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
