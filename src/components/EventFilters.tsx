import { useState, useEffect } from 'react';
import * as dateFns from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Search, X, Filter, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useEvents } from '@/context/EventContext';
import { EventFormat, EventType } from '@/types';
import { EventFilters as EventFiltersType } from '@/hooks/useEventFilters';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

// Define store interface to type the store data from Supabase
interface Store {
  id: string;
  name: string | null;
}

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

// Define props interface for EventFilters
interface EventFiltersProps {
  activeFormat: string;
  setActiveFormat: (format: string) => void;
  activeType: string;
  setActiveType: (type: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

const EventFilters = ({
  activeFormat,
  setActiveFormat,
  activeType,
  setActiveType,
  sortOrder,
  setSortOrder
}: EventFiltersProps) => {
  const { setFilters } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [format, setFormat] = useState<EventFormat | undefined>(undefined);
  const [type, setType] = useState<EventType | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [storeId, setStoreId] = useState<string | undefined>(undefined);
  const [stores, setStores] = useState<Store[]>([]);
  const isMobile = useIsMobile();
  
  // Fetch available stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('store', true);
          
        if (error) throw error;
        
        if (data) {
          setStores(data as Store[]);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };
    
    fetchStores();
  }, []);
  
  const handleSearch = () => {
    const filters: EventFiltersType = {
      searchTerm: searchTerm || undefined,
      location,
      format,
      type,
      startDate: date,
      storeId,
    };
    
    setFilters(filters);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setLocation(undefined);
    setFormat(undefined);
    setType(undefined);
    setDate(undefined);
    setStoreId(undefined);
    setFilters({});
  };
  
  const hasActiveFilters = searchTerm || location || format || type || date || storeId;

  const FiltersContent = () => (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by keyword or name..."
          className="pl-10 bg-background h-11"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-4">
        <div className="font-medium text-sm">Store</div>
        <Select 
          value={storeId} 
          onValueChange={(value) => setStoreId(value || undefined)}
        >
          <SelectTrigger className="w-full bg-background h-11">
            <SelectValue placeholder="Select store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name || `Store ${store.id.substring(0, 6)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        <div className="font-medium text-sm">Location</div>
        <Select 
          value={location} 
          onValueChange={(value) => setLocation(value || undefined)}
        >
          <SelectTrigger className="w-full bg-background h-11">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="Madrid">Madrid</SelectItem>
            <SelectItem value="Barcelona">Barcelona</SelectItem>
            <SelectItem value="Valencia">Valencia</SelectItem>
            <SelectItem value="Sevilla">Sevilla</SelectItem>
            <SelectItem value="Bilbao">Bilbao</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        <div className="font-medium text-sm">Format</div>
        <Select 
          value={format} 
          onValueChange={(value) => setFormat(value as EventFormat || undefined)}
        >
          <SelectTrigger className="w-full bg-background h-11">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            {formatOptions.map((fmt) => (
              <SelectItem key={fmt} value={fmt}>
                {fmt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        <div className="font-medium text-sm">Event Type</div>
        <Select 
          value={type} 
          onValueChange={(value) => setType(value as EventType || undefined)}
        >
          <SelectTrigger className="w-full bg-background h-11">
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {typeOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {typeLabels[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        <div className="font-medium text-sm">Date</div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-11",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? dateFns.format(date, "PPP", { locale: es }) : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setDate(date as Date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button onClick={handleSearch} className="flex-1 h-11">
          Apply Filters
        </Button>
        
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 h-11"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full mb-4 flex items-center justify-center h-11">
            <Sliders className="w-4 h-4 mr-2" />
            <span>Filters</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-4 pb-4">
          <DrawerHeader>
            <DrawerTitle className="flex items-center text-xl">
              <Filter className="h-5 w-5 mr-2" />
              Filter Events
            </DrawerTitle>
          </DrawerHeader>
          <FiltersContent />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <div className="p-6 bg-card rounded-lg border shadow-md mb-6 sticky top-20">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filter Events
        </h2>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
            className="h-9 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>
      
      <FiltersContent />
    </div>
  );
};

export default EventFilters;
