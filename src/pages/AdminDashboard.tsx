
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  CalendarDays, 
  Check, 
  Shield, 
  Store, 
  Trash, 
  User, 
  X, 
  Edit 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { events, deleteEvent } = useEvents();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  
  // Only admin accounts can access this page
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast({
        title: 'Event deleted',
        description: 'The event has been successfully deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the event',
        variant: 'destructive',
      });
    }
  };
  
  // Stats for dashboard
  const totalEvents = events.length;
  const upcomingEvents = events.filter(event => new Date(event.startDate) > new Date()).length;
  const pastEvents = events.filter(event => new Date(event.startDate) < new Date()).length;
  
  // Mock user data
  const users = [
    { id: '1', name: 'Regular User', email: 'user@example.com', role: 'user' },
    { id: '2', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { id: '3', name: 'Magic Store', email: 'store@example.com', role: 'store' },
    { id: '4', name: 'Magic Player', email: 'player@example.com', role: 'user' },
    { id: '5', name: 'Card Shop', email: 'cardshop@example.com', role: 'store' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-magic-purple mr-2" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Events</CardTitle>
                <CardDescription>All events in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CalendarDays className="h-10 w-10 text-magic-purple mr-4" />
                  <span className="text-3xl font-bold">{totalEvents}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <CardDescription>Events scheduled in the future</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CalendarDays className="h-10 w-10 text-magic-green mr-4" />
                  <span className="text-3xl font-bold">{upcomingEvents}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Users</CardTitle>
                <CardDescription>Registered users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <User className="h-10 w-10 text-magic-blue mr-4" />
                  <span className="text-3xl font-bold">{users.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="events">
                <CalendarDays className="h-4 w-4 mr-2" />
                Manage Events
              </TabsTrigger>
              <TabsTrigger value="users">
                <User className="h-4 w-4 mr-2" />
                Manage Users
              </TabsTrigger>
              <TabsTrigger value="stores">
                <Store className="h-4 w-4 mr-2" />
                Manage Stores
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>Events Management</CardTitle>
                  <CardDescription>Manage events across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted">
                        <tr>
                          <th className="px-4 py-3">Event</th>
                          <th className="px-4 py-3">Format</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Store</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.slice(0, 5).map((event) => (
                          <tr key={event.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">{event.title}</td>
                            <td className="px-4 py-3">{event.format}</td>
                            <td className="px-4 py-3">
                              {new Date(event.startDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">{event.location.city}</td>
                            <td className="px-4 py-3">{event.location.name}</td>
                            <td className="px-4 py-3 flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                onClick={() => navigate(`/events/${event.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Users Management</CardTitle>
                  <CardDescription>Manage platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">{user.name}</td>
                            <td className="px-4 py-3">{user.email}</td>
                            <td className="px-4 py-3 capitalize">{user.role}</td>
                            <td className="px-4 py-3 flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stores">
              <Card>
                <CardHeader>
                  <CardTitle>Stores Management</CardTitle>
                  <CardDescription>Manage registered stores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted">
                        <tr>
                          <th className="px-4 py-3">Store Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Events Count</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => u.role === 'store').map((store) => (
                          <tr key={store.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">{store.name}</td>
                            <td className="px-4 py-3">{store.email}</td>
                            <td className="px-4 py-3">Madrid</td>
                            <td className="px-4 py-3">
                              {events.filter(e => e.createdBy === store.id).length}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className="px-4 py-3 flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                  <CardDescription>Overview of platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-20">
                    <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Statistics Dashboard</h3>
                    <p className="text-muted-foreground">
                      Detailed statistics will be available here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
