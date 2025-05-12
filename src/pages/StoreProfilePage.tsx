
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { getStoreProfile, uploadProfileImage, uploadBannerImage, updateProfile } from '@/services/ProfileService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Define the profile interface to match our database schema
interface StoreProfile {
  id: string;
  username: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  avatar_url?: string;
  banner_url?: string;
  created_at: string;
  updated_at: string;
}

const StoreProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    avatar_url: '',
    banner_url: ''
  });
  
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const profileData = await getStoreProfile(id);
        if (profileData) {
          setProfile(profileData as StoreProfile);
          setFormData({
            username: profileData.username || '',
            description: profileData.description || '',
            address: profileData.address || '',
            phone: profileData.phone || '',
            website: profileData.website || '',
            avatar_url: profileData.avatar_url || '',
            banner_url: profileData.banner_url || ''
          });
          
          // Check if current user is the store owner
          setIsOwner(user && user.id === id);
        } else {
          toast.error('Store profile not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching store profile:', error);
        toast.error('Failed to load store profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, navigate, user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    if (!id) return;
    
    try {
      const updatedProfile = await updateProfile({
        username: formData.username,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        website: formData.website
      });
      
      if (updatedProfile) {
        setProfile(updatedProfile as StoreProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    try {
      const imageUrl = await uploadProfileImage(e.target.files[0]);
      setFormData(prev => ({ ...prev, avatar_url: imageUrl }));
      
      // Update profile in database
      await updateProfile({ avatar_url: imageUrl });
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  };
  
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    try {
      const imageUrl = await uploadBannerImage(e.target.files[0]);
      setFormData(prev => ({ ...prev, banner_url: imageUrl }));
      
      // Update profile in database
      await updateProfile({ banner_url: imageUrl });
      toast.success('Banner updated successfully');
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p>Loading store profile...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        {/* Banner */}
        <div className="relative h-60 w-full bg-gradient-to-r from-purple-800 to-indigo-800 overflow-hidden">
          {formData.banner_url && (
            <img 
              src={formData.banner_url} 
              alt="Store Banner" 
              className="w-full h-full object-cover"
            />
          )}
          {isOwner && isEditing && (
            <div className="absolute bottom-4 right-4">
              <label htmlFor="banner-upload" className="cursor-pointer">
                <div className="bg-card hover:bg-card/90 text-primary px-4 py-2 rounded-md shadow">
                  Upload Banner
                </div>
                <input 
                  id="banner-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleBannerChange} 
                  className="hidden" 
                />
              </label>
            </div>
          )}
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          {/* Avatar */}
          <div className="relative rounded-full h-32 w-32 bg-gray-200 border-4 border-background overflow-hidden">
            {formData.avatar_url ? (
              <img 
                src={formData.avatar_url} 
                alt="Store Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-3xl font-bold text-gray-400">
                {profile?.username?.charAt(0) || 'S'}
              </div>
            )}
            {isOwner && isEditing && (
              <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer">
                <div className="text-white text-sm">Change</div>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </label>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-start">
            <div>
              {isEditing ? (
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Store Name"
                  className="text-2xl font-bold"
                />
              ) : (
                <h1 className="text-2xl font-bold">{profile?.username || 'Store'}</h1>
              )}
            </div>
            {isOwner && (
              <div>
                {isEditing ? (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <Tabs defaultValue="info" className="mt-8">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <h2 className="font-medium">Description</h2>
                    {isEditing ? (
                      <Textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        placeholder="Store description"
                        rows={4}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {profile?.description || 'No description available'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="font-medium">Address</h2>
                    {isEditing ? (
                      <Input
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        placeholder="Store address"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {profile?.address || 'No address available'}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h2 className="font-medium">Phone</h2>
                      {isEditing ? (
                        <Input
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleChange}
                          placeholder="Store phone"
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {profile?.phone || 'No phone available'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="font-medium">Website</h2>
                      {isEditing ? (
                        <Input
                          name="website"
                          value={formData.website || ''}
                          onChange={handleChange}
                          placeholder="Store website"
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {profile?.website ? (
                            <a 
                              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {profile.website}
                            </a>
                          ) : (
                            'No website available'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="events">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center py-8 text-muted-foreground">
                    Coming soon: List of events organized by this store
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default StoreProfilePage;
