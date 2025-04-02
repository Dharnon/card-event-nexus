
import { useState } from 'react';
import * as dateFns from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Search, X, Filter } from 'lucide-react';
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
import { EventFilters as EventFiltersType, useEvents } from '@/context/EventContext';
import { EventFormat, EventType } from '@/types';

const formatOptions: EventFormat[] = [
  'Standard', 'Modern', 'Legacy', 'Commander', 'Pioneer', 'Vintage', 'Draft', 'Sealed', 'Prerelease', 'Other'
];

const typeOptions: EventType[] = [
  'Tournament', 'Casual Play', 'Championship', 'League', 'Special Event'
];

const locationOptions = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'
];

const EventFilters = () => {
  const { setFilters } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [format, setFormat] = useState<EventFormat | undefined>(undefined);
  const [type, setType] = useState<EventType | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const handleSearch = () => {
    const filters: EventFiltersType = {
      searchTerm: searchTerm || undefined,
      location,
      format,
      type,
      startDate: date,
    };
    
    setFilters(filters);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setLocation(undefined);
    setFormat(undefined);
    setType(undefined);
    setDate(undefined);
    setFilters({});
  };
  
  const hasActiveFilters = searchTerm || location || format || type || date;
  
  return (
    <div className="p-4 bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filter Events
        </h2>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
            className="h-8 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by keyword..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select 
            value={location} 
            onValueChange={(value) => setLocation(value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={format} 
            onValueChange={(value) => setFormat(value as EventFormat || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((fmt) => (
                <SelectItem key={fmt} value={fmt}>
                  {fmt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={type} 
            onValueChange={(value) => setType(value as EventType || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
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
        
        <Button onClick={handleSearch} className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default EventFilters;
