
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import StoreEventManager from '@/components/store/StoreEventManager';

const StoreProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("events");

  // Redirect if not logged in or not a store user
  if (!user || (user.role !== 'store' && user.role !== 'admin')) {
    navigate('/');
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Store Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {user.role === 'admin' ? 'Admin management panel' : 'Manage your events and store profile'}
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="profile">Store Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events" className="mt-6 p-0">
            <StoreEventManager />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6 p-0">
            <div className="p-6 bg-card border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Store Information</h2>
              <p>Store Name: {user.name}</p>
              <p>Email: {user.email}</p>
              {/* More store profile information could go here */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StoreProfilePage;
