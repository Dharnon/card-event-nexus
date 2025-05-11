
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StoreEventManager from '@/components/store/StoreEventManager';

const StoreProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("events");
  const [isLoading, setIsLoading] = useState(false);
  
  // Store profile state
  const [storeName, setStoreName] = useState(user?.name || '');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeWebsite, setStoreWebsite] = useState('');
  
  // Profile images
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Redirect if not logged in or not a store user
  if (!user || (user.role !== 'store' && user.role !== 'admin')) {
    navigate('/');
    return null;
  }
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };
  
  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Check if 'stores' bucket exists, create if not
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;
      
      if (!buckets?.find(b => b.name === 'stores')) {
        const { error: createError } = await supabase.storage.createBucket('stores', {
          public: true,
          fileSizeLimit: 20971520 // 20MB
        });
        if (createError) throw createError;
      }
      
      const { error: uploadError } = await supabase.storage
        .from('stores')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
        
      if (uploadError) throw uploadError;
      
      const { data: publicURL } = supabase.storage
        .from('stores')
        .getPublicUrl(fileName);
        
      return publicURL.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let avatarUrl = user.avatarUrl;
      let bannerUrl = bannerPreview;
      
      // Upload avatar if changed
      if (avatarFile) {
        const uploadedAvatarUrl = await uploadImage(avatarFile, 'avatars');
        if (uploadedAvatarUrl) avatarUrl = uploadedAvatarUrl;
      }
      
      // Upload banner if changed
      if (bannerFile) {
        const uploadedBannerUrl = await uploadImage(bannerFile, 'banners');
        if (uploadedBannerUrl) bannerUrl = uploadedBannerUrl;
      }
      
      // Update profiles table with new data
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: storeName, // Use username field for store name
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          description: storeDescription,
          address: storeAddress,
          phone: storePhone,
          website: storeWebsite
        });
      
      if (error) throw error;
      
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Card>
              <CardHeader>
                <CardTitle>Store Profile</CardTitle>
                <CardDescription>
                  Customize your store profile information and appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Banner Image */}
                <div className="space-y-2">
                  <Label>Banner Image</Label>
                  <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border">
                    {bannerPreview ? (
                      <img 
                        src={bannerPreview} 
                        alt="Store Banner" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <p className="text-muted-foreground">No banner image</p>
                      </div>
                    )}
                    <div className="absolute right-4 bottom-4">
                      <Label 
                        htmlFor="banner-upload" 
                        className="bg-background hover:bg-accent p-2 rounded-full cursor-pointer border shadow-sm"
                      >
                        <Upload className="h-5 w-5" />
                        <span className="sr-only">Upload banner</span>
                      </Label>
                      <Input 
                        id="banner-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleBannerChange}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Avatar */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border border-border">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Store Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <p className="text-muted-foreground text-sm">No image</p>
                        </div>
                      )}
                      <div className="absolute right-1 bottom-1">
                        <Label 
                          htmlFor="avatar-upload" 
                          className="bg-background hover:bg-accent p-1.5 rounded-full cursor-pointer border shadow-sm"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="sr-only">Upload avatar</span>
                        </Label>
                        <Input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm">Upload a store logo or profile picture</p>
                      <p className="text-xs text-muted-foreground">Recommended size: 400x400px</p>
                    </div>
                  </div>
                </div>
                
                {/* Store Name */}
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input 
                    id="store-name" 
                    value={storeName} 
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
                
                {/* Store Description */}
                <div className="space-y-2">
                  <Label htmlFor="store-description">Description</Label>
                  <Textarea 
                    id="store-description" 
                    value={storeDescription} 
                    onChange={(e) => setStoreDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell visitors about your store"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="store-address">Address</Label>
                    <Input 
                      id="store-address" 
                      value={storeAddress} 
                      onChange={(e) => setStoreAddress(e.target.value)}
                      placeholder="Your physical location"
                    />
                  </div>
                  
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Phone</Label>
                    <Input 
                      id="store-phone" 
                      value={storePhone} 
                      onChange={(e) => setStorePhone(e.target.value)}
                      placeholder="Contact number"
                    />
                  </div>
                </div>
                
                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="store-website">Website</Label>
                  <Input 
                    id="store-website" 
                    value={storeWebsite} 
                    onChange={(e) => setStoreWebsite(e.target.value)}
                    placeholder="Your website URL"
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isLoading} 
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StoreProfilePage;
