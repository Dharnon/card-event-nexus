
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types';
import { 
  EventImageUploader, 
  BasicEventInfoSection, 
  DateTimeSection, 
  LocationSection,
  AdditionalDetailsSection,
} from './EventFormSections';
import { Loader2 } from 'lucide-react';
import { useEventFormSubmit } from './useEventFormSubmit';

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

export type FormValues = z.infer<typeof formSchema>;

interface CreateEventFormProps {
  eventId?: string;
  initialEvent?: Event;
}

const CreateEventForm = ({ eventId, initialEvent }: CreateEventFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialEvent?.image || null);
  const { user } = useAuth();
  const { isSubmitting, handleSubmit, isEditing } = useEventFormSubmit(eventId, initialEvent);

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
    
    // Default store name based on user if available, or a generic name
    const storeName = user?.role === 'store' ? `Magic Store ${user?.name || ''}` : 'Magic Store';
    
    // Provide default values for all form fields to prevent uncontrolled to controlled warnings
    return {
      title: '',
      description: '',
      format: 'Standard',
      type: 'tournament',
      date: new Date(),
      time: '18:00',
      duration: '4',
      locationName: storeName,
      city: '',
      address: '',
      price: '10',
      maxParticipants: '32',
      featured: false,
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
    mode: 'onBlur', // Validate fields when they lose focus
  });

  const onSubmit = (values: FormValues) => {
    handleSubmit(values, imageFile, imagePreview);
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
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating Event...' : 'Creating Event...'}
              </>
            ) : (
              isEditing ? 'Update Event' : 'Create Event'
            )}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
};

export default CreateEventForm;
