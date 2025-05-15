
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeckManager from '@/components/profile/DeckManager';
import StatsDisplay from '@/components/profile/StatsDisplay';
import EventTracker from '@/components/profile/EventTracker';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/context/ThemeContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("decks");
  const isMobile = useIsMobile();
  const { theme } = useTheme();

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
    <div className="min-h-screen bg-gradient-to-br from-background to-background/90">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-magic-purple to-magic-blue bg-clip-text text-transparent">
                Deck Manager
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your decks, events and game statistics
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 border-magic-purple/30 hover:bg-magic-purple/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to app
            </Button>
          </div>
          
          <Separator className="my-2 bg-magic-purple/20" />
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full max-w-md bg-background/50 border border-magic-purple/20">
              <TabsTrigger 
                value="decks" 
                className="data-[state=active]:bg-magic-purple data-[state=active]:text-white"
              >
                Decks
              </TabsTrigger>
              <TabsTrigger 
                value="stats"
                className="data-[state=active]:bg-magic-purple data-[state=active]:text-white"
              >
                Statistics
              </TabsTrigger>
              <TabsTrigger 
                value="events"
                className="data-[state=active]:bg-magic-purple data-[state=active]:text-white"
              >
                Events
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="decks" className="mt-6 p-0">
              <DeckManager />
            </TabsContent>
            
            <TabsContent value="stats" className="mt-6 p-0">
              <StatsDisplay />
            </TabsContent>
            
            <TabsContent value="events" className="mt-6 p-0">
              <EventTracker />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
