
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Event } from '@/types';
import { toast } from 'sonner';
import { uploadEventImage } from './ImageUploadService';
import { 
  EventImageUploader, 
  BasicEventInfoSection, 
  DateTimeSection, 
  LocationSection,
  AdditionalDetailsSection,
} from './EventFormSections';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }),
  format: z.enum(['Standard', 'Modern', 'Legacy', 'Commander', 'Pioneer', 'Vintage', 'Draft', 'Sealed', 'Prerelease', 'Other'] as const),
  type: z.enum(['tournament', 'casual', 'championship', 'draft', 'prerelease', 'other'] as const),
  date: z.date({ required_error: 'Please select a date' }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Please enter a valid time in 24h format' }),
  duration: z.string().min(1, { message: 'Please enter the duration' }),
  locationName: z.string().min(3, { message: 'Location name is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  price: z.string().optional(),
  maxParticipants: z.string().optional(),
  featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateEventFormProps {
  eventId?: string;
  initialEvent?: Event;
}

const CreateEventForm = ({ eventId, initialEvent }: CreateEventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialEvent?.image || null);
  const { user } = useAuth();
  const { addEvent, updateEventData } = useEvents();
  const navigate = useNavigate();
  const isEditing = !!eventId;

  // Prepare default values based on the initial event if we're editing
  const getDefaultValues = (): Partial<FormValues> => {
    if (initialEvent) {
      const startDate = new Date(initialEvent.startDate);
      
      return {
        title: initialEvent.title,
        description: initialEvent.description,
        format: initialEvent.format,
        type: initialEvent.type,
        date: startDate,
        time: startDate.toTimeString().slice(0, 5),
        duration: initialEvent.endDate ? 
          String(Math.round((new Date(initialEvent.endDate).getTime() - startDate.getTime()) / (1000 * 60 * 60))) : 
          '4',
        locationName: initialEvent.location.name,
        city: initialEvent.location.city,
        address: initialEvent.location.address,
        price: initialEvent.price !== undefined ? String(initialEvent.price) : '',
        maxParticipants: initialEvent.maxParticipants !== undefined ? String(initialEvent.maxParticipants) : '',
        featured: initialEvent.featured || false,
      };
    }
    
    return {
      format: 'Standard',
      type: 'tournament',
      time: '18:00',
      duration: '4',
      locationName: user?.role === 'store' ? `Magic Store ${user.name}` : '',
      city: '',
      price: '10',
      maxParticipants: '32',
      featured: false,
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to create an event');
      return;
    }
    
    setIsSubmitting(true);
    toast.loading(isEditing ? 'Updating event...' : 'Creating event...');
    
    try {
      // Upload image if one is selected
      let imageUrl = initialEvent?.image || null;
      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile);
      }
      
      // Parse date and time
      const startDate = new Date(values.date);
      const [hours, minutes] = values.time.split(':').map(Number);
      startDate.setHours(hours, minutes);
      
      // Calculate end time based on duration
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + Number(values.duration));
      
      // Create event object
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
          country: 'Spain',
        },
        price: values.price ? Number(values.price) : undefined,
        maxParticipants: values.maxParticipants ? Number(values.maxParticipants) : undefined,
        currentParticipants: initialEvent?.currentParticipants || 0,
        image: imageUrl,
        featured: values.featured,
        createdBy: user.id,
      };
      
      if (isEditing && eventId) {
        // Update existing event
        const updated = await updateEventData(eventId, eventData);
        toast.dismiss();
        toast.success('Event updated successfully', {
          description: `Event "${updated.title}" has been updated in the database.`
        });
        navigate(`/events/${eventId}`);
      } else {
        // Create new event
        const event = await addEvent(eventData);
        toast.dismiss();
        toast.success('Event created successfully', {
          description: `Event "${event.title}" has been added to the database.`
        });
        navigate(`/events/${event.id}`);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.dismiss();
      toast.error('There was an error saving your event', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            {/* Event Image Uploader */}
            <EventImageUploader 
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              setImageFile={setImageFile}
            />
            
            {/* Basic Event Information */}
            <BasicEventInfoSection />
            
            {/* Date and Time */}
            <DateTimeSection />
            
            {/* Location */}
            <LocationSection />
            
            {/* Additional Details */}
            <AdditionalDetailsSection isAdmin={user?.role === 'admin'} />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? 'Updating Event...' : 'Creating Event...') : (isEditing ? 'Update Event' : 'Create Event')}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
};

export default CreateEventForm;
