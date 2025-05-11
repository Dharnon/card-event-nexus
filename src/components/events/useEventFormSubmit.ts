
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types';
import { toast } from 'sonner';
import { uploadEventImage } from './ImageUploadService';
import { FormValues } from './CreateEventForm';

export const useEventFormSubmit = (eventId?: string, initialEvent?: Event) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { addEvent, updateEventData } = useEvents();
  const navigate = useNavigate();
  const isEditing = !!eventId;

  const handleSubmit = async (
    values: FormValues, 
    imageFile: File | null,
    imagePreview: string | null
  ) => {
    setIsSubmitting(true);
    const toastId = toast.loading(isEditing ? 'Updating event...' : 'Creating event...', {
      duration: 60000, // Long duration as we'll dismiss it manually
    });
    
    try {
      // Upload image if one is selected
      let imageUrl = initialEvent?.image || null;
      if (imageFile) {
        try {
          imageUrl = await uploadEventImage(imageFile);
        } catch (error) {
          console.error("Image upload error:", error);
          toast.error("Failed to upload image, but continuing with event creation", { id: toastId });
        }
      }
      
      // Parse date and time
      const startDate = new Date(values.date);
      const [hours, minutes] = values.time.split(':').map(Number);
      startDate.setHours(hours, minutes);
      
      // Calculate end time based on duration
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + Number(values.duration));
      
      // Create event object with all required fields and proper types
      const eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        title: values.title,
        description: values.description,
        format: values.format,
        type: values.type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: {
          name: values.locationName,
          address: values.address,
          city: values.city,
          country: 'Spain', // Default country
          postalCode: '' // Add empty postal code to match schema
        },
        price: values.price ? Number(values.price) : undefined,
        maxParticipants: values.maxParticipants ? Number(values.maxParticipants) : undefined,
        currentParticipants: initialEvent?.currentParticipants || 0,
        image: imageUrl,
        featured: values.featured,
        createdBy: user?.id || '00000000-0000-0000-0000-000000000000', // Use anonymous ID if no user
      };
      
      console.log('Saving event with data:', eventData);
      
      if (isEditing && eventId) {
        // Update existing event
        try {
          const updated = await updateEventData(eventId, eventData);
          toast.dismiss(toastId);
          toast.success('Event updated successfully', {
            description: `Event "${updated.title}" has been updated in the database.`
          });
          navigate(`/events/${eventId}`);
        } catch (error: any) {
          console.error('Error updating event:', error);
          toast.dismiss(toastId);
          toast.error('Failed to update event', {
            description: error instanceof Error ? error.message : String(error)
          });
        }
      } else {
        // Create new event
        try {
          const event = await addEvent(eventData);
          toast.dismiss(toastId);
          toast.success('Event created successfully', {
            description: `Event "${event.title}" has been added to the database.`
          });
          navigate(`/events/${event.id}`);
        } catch (error: any) {
          console.error('Error saving event:', error);
          toast.dismiss(toastId);
          toast.error('Failed to create event', {
            description: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast.dismiss(toastId);
      toast.error('There was an error saving your event', {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
    isEditing
  };
};
