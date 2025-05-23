import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeckManager from '@/components/profile/DeckManager';
import StatsDisplay from '@/components/profile/StatsDisplay';
import EventTracker from '@/components/profile/EventTracker';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/context/ThemeContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import GameLifeTracker from '@/components/profile/GameLifeTracker';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("decks");
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [lifeCounterOpen, setLifeCounterOpen] = useState(false);

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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Deck Manager
              </h1>
              <p className="text-muted-foreground">
                Manage your decks, events and game statistics
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setLifeCounterOpen(true)}
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4 text-red-500" />
                Life Counter
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to app
              </Button>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="decks">
                Decks
              </TabsTrigger>
              <TabsTrigger value="stats">
                Statistics
              </TabsTrigger>
              <TabsTrigger value="events">
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
      
      {/* Life Counter Dialog */}
      <Dialog open={lifeCounterOpen} onOpenChange={setLifeCounterOpen}>
        <DialogContent className="p-0 sm:max-w-[400px] h-[80vh]">
          <GameLifeTracker
            deckId="quickaccess"
            onGameEnd={() => setLifeCounterOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
