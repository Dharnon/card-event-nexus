
import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param file The file to upload
 * @returns The public URL of the uploaded image or null if upload fails
 */
export const uploadEventImage = async (file: File): Promise<string | null> => {
  try {
    // Check if storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const eventsBucket = buckets?.find(b => b.name === 'events');
    
    // Create the bucket if it doesn't exist
    if (!eventsBucket) {
      await supabase.storage.createBucket('events', { public: true });
    }
    
    // Upload the file
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('events')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('events')
      .getPublicUrl(data.path);
      
    return publicURL.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
