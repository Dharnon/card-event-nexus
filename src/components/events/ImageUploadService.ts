
import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param file The file to upload
 * @returns The public URL of the uploaded image or null if upload fails
 */
export const uploadEventImage = async (file: File): Promise<string | null> => {
  try {
    console.log('Starting image upload process');
    
    // First check if 'events' bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw bucketsError;
    }
    
    console.log('Available buckets:', buckets);
    
    let eventsBucket = buckets?.find(b => b.name === 'events');
    
    // Create the bucket if it doesn't exist
    if (!eventsBucket) {
      console.log('Events bucket not found, creating it');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('events', {
        public: true,
        fileSizeLimit: 20971520 // 20MB to allow larger images
      });
      
      if (createError) {
        console.error('Error creating events bucket:', createError);
        throw createError;
      }
      
      console.log('New bucket created:', newBucket);
    }
    
    // Generate a unique filename with original extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    console.log(`Uploading file: ${fileName} to events bucket`);
    
    const { data, error } = await supabase.storage
      .from('events')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Changed to true to allow overwriting if needed
        contentType: file.type // Set the correct content type
      });
      
    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
    
    console.log('File uploaded successfully:', data);
    
    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('events')
      .getPublicUrl(data.path);
      
    console.log('Generated public URL:', publicURL);
    return publicURL.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
