
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock, ImagePlus } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { EventFormat, EventType, Event } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const formatOptions: EventFormat[] = [
  'Standard', 'Modern', 'Legacy', 'Commander', 'Pioneer', 'Vintage', 'Draft', 'Sealed', 'Prerelease', 'Other'
];

const typeOptions: EventType[] = [
  'tournament', 'casual', 'championship', 'draft', 'prerelease', 'other'
];

const typeLabels: Record<EventType, string> = {
  'tournament': 'Tournament',
  'casual': 'Casual Play',
  'championship': 'Championship',
  'draft': 'Draft',
  'prerelease': 'Prerelease',
  'other': 'Other'
};

const locationOptions = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'
];

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
  const getDefaultValues = (): FormValues => {
    if (initialEvent) {
      const startDate = new Date(initialEvent.startDate);
      
      return {
        title: initialEvent.title,
        description: initialEvent.description,
        format: initialEvent.format,
        type: initialEvent.type,
        date: startDate,
        time: format(startDate, 'HH:mm'),
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
      title: '',
      description: '',
      format: 'Standard',
      type: 'tournament',
      time: '18:00',
      duration: '4',
      locationName: user?.role === 'store' ? `Magic Store ${user.name}` : '',
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
  });

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
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

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to create an event');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload image if one is selected
      let imageUrl = initialEvent?.image || null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
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
        await updateEventData(eventId, eventData);
        toast.success('Event updated successfully');
        navigate(`/events/${eventId}`);
      } else {
        // Create new event
        const event = await addEvent(eventData);
        toast.success('Event created successfully');
        navigate(`/events/${event.id}`);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('There was an error saving your event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Event Information</h2>
            <p className="text-muted-foreground">Basic details about your event</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="image" className="text-sm font-medium">
                Event Image
              </label>
              <div className="flex items-center space-x-4">
                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded overflow-hidden border">
                    <img 
                      src={imagePreview} 
                      alt="Event preview" 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 w-6 h-6 p-0"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border rounded flex items-center justify-center text-muted-foreground">
                    <ImagePlus className="h-8 w-8" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 1280 x 720px (16:9 ratio)
                  </p>
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Modern Championship" {...field} />
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
                    <Textarea 
                      placeholder="Provide details about your event..." 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formatOptions.map((format) => (
                          <SelectItem key={format} value={format}>
                            {format}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {typeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Time & Date</h2>
            <p className="text-muted-foreground">When will your event take place</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="18:00" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>24-hour format (HH:MM)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={12} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Location</h2>
            <p className="text-muted-foreground">Where will your event take place</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="locationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Magic Store Madrid" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locationOptions.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Calle Principal 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Event Details</h2>
            <p className="text-muted-foreground">Additional information about your event</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (€)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0 for free events" {...field} />
                  </FormControl>
                  <FormDescription>Leave empty for free events</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Participants</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="Leave empty for unlimited" {...field} />
                  </FormControl>
                  <FormDescription>Leave empty for unlimited</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {user?.role === 'admin' && (
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 md:col-span-2 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-1 text-primary border-primary rounded"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Event</FormLabel>
                      <FormDescription>
                        Featured events appear prominently on the homepage
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? 'Updating Event...' : 'Creating Event...') : (isEditing ? 'Update Event' : 'Create Event')}
        </Button>
      </form>
    </Form>
  );
};

export default CreateEventForm;
