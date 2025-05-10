
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, Store, Calendar, BarChart3 } from 'lucide-react';
import StoreEventManager from '@/components/store/StoreEventManager';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  if (!user || user.role !== 'admin') {
    return null;
  }

  const navigateToSection = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage all aspects of the application
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
                onClick={() => navigateToSection('/admin/users')}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">User Management</CardTitle>
              </div>
              <CardDescription>Manage store users and admins</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Create, edit, and delete store and admin users.
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigateToSection('/stores')}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Store Management</CardTitle>
              </div>
              <CardDescription>View and manage store profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                View and edit store information and profiles.
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigateToSection('/admin/statistics')}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Statistics</CardTitle>
              </div>
              <CardDescription>View platform analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Access detailed statistics about users, events, and platform usage.
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigateToSection('/events')}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Event Management</CardTitle>
              </div>
              <CardDescription>Manage all platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Create, edit, and delete events across all stores.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Separator className="my-2" />
        
        <h2 className="text-xl font-bold mt-4">Events Overview</h2>
        <StoreEventManager />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
