
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import EventRegistrationManager from '@/components/store/EventRegistrationManager';
import { getProfile, updateProfile, uploadProfileImage, uploadBannerImage } from '@/services/ProfileService';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { ImagePlus, Save } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { useEvents } from '@/context/EventContext';

const formSchema = z.object({
  username: z.string().min(2).max(50),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

const StoreProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { events } = useEvents();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeEvents, setStoreEvents] = useState([]);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      description: '',
      address: '',
      phone: '',
      website: '',
    },
  });
  
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getProfile();
      if (profile) {
        form.reset({
          username: profile.username || '',
          description: profile.description || '',
          address: profile.address || '',
          phone: profile.phone || '',
          website: profile.website || '',
        });
        setAvatarUrl(profile.avatar_url);
        setBannerUrl(profile.banner_url);
      }
    };
    
    if (user && user.id === id) {
      loadProfile();
    }
    
    // Filter events for this store
    if (events.length > 0 && id) {
      const filteredEvents = events.filter(event => event.createdBy === id);
      setStoreEvents(filteredEvents);
    }
  }, [user, id, events, form]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const updates: any = { ...values };
      
      // Upload avatar if changed
      if (avatarFile) {
        const avatarUrl = await uploadProfileImage(avatarFile);
        updates.avatar_url = avatarUrl;
      }
      
      // Upload banner if changed
      if (bannerFile) {
        const bannerUrl = await uploadBannerImage(bannerFile);
        updates.banner_url = bannerUrl;
      }
      
      await updateProfile(updates);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isCurrentUserStore = user && user.id === id;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Banner */}
          <div className="relative w-full h-48 bg-muted rounded-b-lg overflow-hidden">
            {bannerUrl ? (
              <img 
                src={bannerUrl} 
                alt="Store banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
                <p className="text-white text-lg opacity-50">Store Banner</p>
              </div>
            )}
            
            {isEditing && (
              <label htmlFor="banner" className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-background">
                <ImagePlus className="h-5 w-5" />
                <input 
                  id="banner" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleBannerChange}
                />
              </label>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mt-6">
            {/* Sidebar with Store Info */}
            <div className="w-full md:w-1/3 space-y-4">
              <Card>
                <CardHeader className="relative pb-2">
                  <div className="flex justify-between items-start">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border-4 border-background">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt="Store avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                              {form.watch('username')?.charAt(0) || 'S'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {isEditing && (
                        <label htmlFor="avatar" className="absolute -right-2 bottom-0 bg-background rounded-full p-1 cursor-pointer hover:bg-muted">
                          <ImagePlus className="h-4 w-4" />
                          <input 
                            id="avatar" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleAvatarChange}
                          />
                        </label>
                      )}
                    </div>
                    
                    {isCurrentUserStore && !isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                  
                  <CardTitle className="mt-3">
                    {form.watch('username') || 'Store Name'}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-2">
                  {isEditing ? (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Store Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="min-h-[100px]" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://example.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsEditing(false)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>Saving...</>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-4">
                      {form.watch('description') && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">About</h3>
                          <p className="text-sm">{form.watch('description')}</p>
                        </div>
                      )}
                      
                      {(form.watch('address') || form.watch('phone') || form.watch('website')) && (
                        <div className="border-t pt-3">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Info</h3>
                          {form.watch('address') && (
                            <div className="text-sm mb-1">
                              <span className="font-medium">Address: </span>
                              {form.watch('address')}
                            </div>
                          )}
                          {form.watch('phone') && (
                            <div className="text-sm mb-1">
                              <span className="font-medium">Phone: </span>
                              {form.watch('phone')}
                            </div>
                          )}
                          {form.watch('website') && (
                            <div className="text-sm">
                              <span className="font-medium">Website: </span>
                              <a href={form.watch('website')} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {form.watch('website')}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="events" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="events">Store Events</TabsTrigger>
                </TabsList>
                
                <TabsContent value="events" className="pt-2">
                  <EventRegistrationManager />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoreProfilePage;
