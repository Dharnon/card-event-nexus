
import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param file The file to upload
 * @returns The public URL of the uploaded image or null if upload fails
 */
export const uploadEventImage = async (file: File): Promise<string | null> => {
  try {
    console.log('Starting image upload process');
    
    if (!file) {
      console.error('No file provided for upload');
      return null;
    }
    
    // Generate a unique filename with original extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    console.log(`Uploading file: ${fileName} to event_photos bucket`);
    
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      throw bucketsError;
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('event_photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
      
    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
    
    console.log('File uploaded successfully:', data);
    
    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('event_photos')
      .getPublicUrl(data.path);
      
    console.log('Generated public URL:', publicURL);
    return publicURL.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Helper function to upload profile images
 * @param file The file to upload
 * @param userId The user ID for naming
 * @returns The public URL of the uploaded image or null if upload fails
 */
export const uploadProfileImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    console.log('Starting profile image upload process');
    
    if (!file) {
      console.error('No file provided for upload');
      return null;
    }
    
    // Generate filename with user ID for consistency
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    console.log(`Uploading file: ${fileName} to avatars bucket`);
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
      
    if (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
    
    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);
      
    return publicURL.publicUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return null;
  }
};

/**
 * Helper function to upload banner images
 * @param file The file to upload
 * @param userId The user ID for naming
 * @returns The public URL of the uploaded image or null if upload fails
 */
export const uploadBannerImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    console.log('Starting banner image upload process');
    
    if (!file) {
      console.error('No file provided for upload');
      return null;
    }
    
    // Generate filename with user ID for consistency
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    console.log(`Uploading file: ${fileName} to banners bucket`);
    
    const { data, error } = await supabase.storage
      .from('banners')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
      
    if (error) {
      console.error('Error uploading banner:', error);
      throw error;
    }
    
    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('banners')
      .getPublicUrl(data.path);
      
    return publicURL.publicUrl;
  } catch (error) {
    console.error('Error uploading banner:', error);
    return null;
  }
};
