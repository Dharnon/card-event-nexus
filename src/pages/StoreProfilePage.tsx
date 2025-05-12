
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStoreProfile, StoreProfile, updateProfile } from '@/services/ProfileService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadBannerImage, uploadProfileImage } from '@/components/events/ImageUploadService';
import StoreEventManager from '@/components/store/StoreEventManager';

// Rename to avoid conflict with imported interface
interface ProfileData extends Omit<StoreProfile, 'id'> {
  id?: string;
}

const StoreProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("information");
  const [formData, setFormData] = useState<ProfileData>({
    username: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    avatar_url: '',
    banner_url: '',
    created_at: '',
    updated_at: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Get the current authenticated user
        const { data: userData } = await supabase.auth.getUser();
        setCurrentUser(userData?.user || null);

        // If no ID provided in URL, use current user's ID
        const profileId = id || userData?.user?.id;

        if (profileId) {
          const storeData = await getStoreProfile(profileId);
          
          if (storeData) {
            setProfile(storeData);
            setFormData({
              username: storeData.username || '',
              description: storeData.description || '',
              address: storeData.address || '',
              phone: storeData.phone || '',
              website: storeData.website || '',
              avatar_url: storeData.avatar_url || '',
              banner_url: storeData.banner_url || '',
              created_at: storeData.created_at || '',
              updated_at: storeData.updated_at || '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load store profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setUploading(true);

      // Save the profile changes to the database
      if (profile && profile.id) {
        const updatedProfile = await updateProfile({
          ...formData,
          id: profile.id
        });
        
        if (updatedProfile) {
          setProfile(updatedProfile);
          toast.success('Profile updated successfully');
        }
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      if (!profile || !profile.id) {
        toast.error('Please save your profile first');
        return;
      }

      setUploading(true);
      const file = e.target.files[0];
      const avatarUrl = await uploadProfileImage(file, profile.id);

      if (avatarUrl) {
        // Update the local state
        setFormData((prev) => ({
          ...prev,
          avatar_url: avatarUrl,
        }));
        
        // Update the profile in the database
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', profile.id);
          
        setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
        toast.success('Avatar uploaded successfully');
      } else {
        toast.error('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      if (!profile || !profile.id) {
        toast.error('Please save your profile first');
        return;
      }

      setUploading(true);
      const file = e.target.files[0];
      const bannerUrl = await uploadBannerImage(file, profile.id);

      if (bannerUrl) {
        // Update the local state
        setFormData((prev) => ({
          ...prev,
          banner_url: bannerUrl,
        }));
        
        // Update the profile in the database
        await supabase
          .from('profiles')
          .update({ banner_url: bannerUrl })
          .eq('id', profile.id);
          
        setProfile(prev => prev ? { ...prev, banner_url: bannerUrl } : null);
        toast.success('Banner uploaded successfully');
      } else {
        toast.error('Failed to upload banner');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  // If loading, show a loading message
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <p>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  // If no profile found, show a message
  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <p>Store profile not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {/* Banner and avatar section */}
        <div className="relative mb-8">
          <div className="h-48 bg-gray-200 rounded-lg overflow-hidden">
            {formData.banner_url ? (
              <img
                src={formData.banner_url}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-400">No banner image</p>
              </div>
            )}
            {isEditing && isOwnProfile && (
              <div className="absolute top-4 right-4">
                <label htmlFor="banner-upload" className="cursor-pointer">
                  <div className="bg-primary text-white p-2 rounded-md">
                    Upload banner
                  </div>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={formData.avatar_url || ''} alt={formData.username || 'Store'} />
                <AvatarFallback>{(formData.username || 'Store')[0]}</AvatarFallback>
              </Avatar>
              {isEditing && isOwnProfile && (
                <div className="absolute bottom-0 right-0">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="bg-primary text-white p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store details */}
        <div className="mt-16 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold">{profile.username || 'Unnamed Store'}</h1>
              {isOwnProfile && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={uploading}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="information">Information</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
              </TabsList>

              <TabsContent value="information">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {isEditing && isOwnProfile && (
                      <div className="space-y-2">
                        <h2 className="font-medium">Store Name</h2>
                        <Input
                          name="username"
                          value={formData.username || ''}
                          onChange={handleChange}
                          placeholder="Store name"
                        />
                      </div>
                    )}
                    
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
                          {profile.description || 'No description available'}
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
                          {profile.address || 'No address available'}
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
                            {profile.phone || 'No phone available'}
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
                            {profile.website ? (
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
                    {/* Use the StoreEventManager component */}
                    <StoreEventManager storeId={profile.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Store Inventory</h2>
                    <p className="text-muted-foreground">Inventory management coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StoreProfilePage;
