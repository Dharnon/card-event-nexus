
import React from 'react';
import { Event } from '@/types';
import { parseISO, format } from 'date-fns';
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
  Feature,
  Status
} from '@/components/ui/calendar';
import { Link } from 'react-router-dom';

interface EventCalendarProps {
  events: Event[];
}

const EventCalendarNew: React.FC<EventCalendarProps> = ({ events }) => {
  const currentYear = new Date().getFullYear();
  
  // Convert events to features format required by the calendar
  const eventFeatures: Feature[] = events.map(event => {
    // Determine status color based on event type
    let statusColor = "#6B7280"; // Default gray
    
    switch (event.type) {
      case "tournament":
        statusColor = "#0EA5E9"; // Blue
        break;
      case "championship":
        statusColor = "#8B5CF6"; // Purple
        break;
      case "prerelease":
        statusColor = "#F97316"; // Orange
        break;
      case "draft":
        statusColor = "#10B981"; // Green
        break;
      case "casual":
        statusColor = "#F59E0B"; // Yellow
        break;
      default:
        statusColor = "#6B7280"; // Gray
    }
    
    const status: Status = {
      id: event.id,
      name: event.type,
      color: statusColor
    };
    
    return {
      id: event.id,
      name: event.title,
      startAt: parseISO(event.startDate),
      endAt: parseISO(event.endDate || event.startDate),
      status: status
    };
  });
  
  // Get earliest and latest year from events
  const years = events.map(event => 
    parseISO(event.startDate).getFullYear()
  );
  
  const earliestYear = Math.min(...years, currentYear - 1);
  const latestYear = Math.max(...years, currentYear + 1);
  
  // Custom Calendar Item that links to event detail
  const CustomCalendarItem = ({ feature }: { feature: Feature }) => (
    <Link 
      to={`/events/${feature.id}`} 
      className="block hover:bg-accent rounded-sm px-1 py-0.5 text-xs" 
      key={feature.id}
    >
      <div className="flex items-center gap-1">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: feature.status.color,
          }}
        />
        <span className="truncate">{feature.name}</span>
      </div>
    </Link>
  );
  
  return (
    <CalendarProvider className="h-full border rounded-lg bg-card">
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
          <CalendarYearPicker 
            start={earliestYear} 
            end={latestYear} 
          />
        </CalendarDatePicker>
        <CalendarDatePagination />
      </CalendarDate>
      <CalendarHeader />
      <CalendarBody features={eventFeatures}>
        {({ feature }) => <CustomCalendarItem feature={feature} />}
      </CalendarBody>
    </CalendarProvider>
  );
};

export default EventCalendarNew;
