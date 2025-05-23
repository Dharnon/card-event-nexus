
"use client"

import * as React from "react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose 
} from "@/components/ui/dialog"
import { X } from "lucide-react"

interface Event {
  id: number | string
  name: string
  time: string
  datetime: string
}

interface CalendarData {
  day: Date
  events: Event[]
}

interface FullScreenCalendarProps {
  data: CalendarData[]
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
]

export function FullScreenCalendar({ data }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
  const [showEventDetails, setShowEventDetails] = React.useState(false)
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { user } = useAuth()
  const isStoreUser = user && user.role === 'store'
  const navigate = useNavigate()

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
    setSelectedDay(today)
  }

  const selectedDayEvents = data
    .filter((date) => selectedDay && isSameDay(date.day, selectedDay))
    .flatMap((date) => date.events)

  const handleEventClick = (eventId: string | number) => {
    navigate(`/events/${eventId}`)
  }

  const currentMonthLabel = format(firstDayCurrentMonth, "MMMM, yyyy");
  const currentYearNumber = format(firstDayCurrentMonth, "yyyy");
  const currentMonthNumber = format(firstDayCurrentMonth, "MMM");
  const currentDayNumber = format(today, "d");

  return (
    <div className="flex flex-1 flex-col">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-20 flex-col items-center justify-center border p-0.5 shadow-sm md:flex bg-card rounded-sm">
              <h1 className="p-1 text-xs uppercase text-muted-foreground">
                {currentMonthNumber}
              </h1>
              <div className="flex w-full items-center justify-center border bg-background p-0.5 text-lg font-bold rounded-sm">
                <span>{currentDayNumber}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                {currentMonthLabel}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div className="inline-flex w-full -space-x-px shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse rounded-sm">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-l-sm last:rounded-r-sm focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              Today
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-l-sm last:rounded-r-sm focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Separator
            orientation="horizontal"
            className="block w-full md:hidden"
          />

          {isStoreUser && (
            <Button 
              className="w-full gap-2 md:w-auto rounded-sm bg-black hover:bg-black/90" 
              asChild
            >
              <Link to="/events/create">
                <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
                <span>New Event</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border text-center text-xs font-semibold leading-6 lg:flex-none">
          <div className="border-r py-2.5">Sun</div>
          <div className="border-r py-2.5">Mon</div>
          <div className="border-r py-2.5">Tue</div>
          <div className="border-r py-2.5">Wed</div>
          <div className="border-r py-2.5">Thu</div>
          <div className="border-r py-2.5">Fri</div>
          <div className="py-2.5">Sat</div>
        </div>

        {/* Calendar Days */}
        <div className="flex text-xs leading-6 lg:flex-auto">
          <div className="hidden w-full border-x lg:grid lg:grid-cols-7 lg:grid-rows-5">
            {days.map((day, dayIdx) => {
              const dayEvents = data.filter((date) => isSameDay(date.day, day))
                .flatMap((date) => date.events);
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={dayIdx}
                  className={cn(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "bg-accent/50 text-muted-foreground",
                    "relative flex flex-col border-b border-r hover:bg-muted/30 focus:z-10 min-h-28",
                  )}
                >
                  <header className="flex items-center justify-between p-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        isToday(day) && "bg-black text-white",
                        "flex h-7 w-7 items-center justify-center text-xs",
                        isEqual(day, selectedDay) && !isToday(day) && "border border-black",
                      )}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                    </button>
                  </header>
                  <div className="flex-1 px-2 pb-2">
                    {dayEvents.map((event, eventIdx) => (
                      <button
                        key={`${event.id}-${eventIdx}`}
                        className="flex items-center gap-1 text-xs hover:bg-accent/50 px-1 py-0.5 rounded-sm w-full text-left"
                        onClick={() => handleEventClick(event.id)}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        <span className="truncate">{event.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x lg:hidden">
            {days.map((day, dayIdx) => {
              const dayEvents = data.filter((date) => isSameDay(date.day, day))
                .flatMap((date) => date.events);
              const hasEvents = dayEvents.length > 0;
              const isCurrentDay = isToday(day);
              
              return (
                <Dialog key={dayIdx}>
                  <DialogTrigger asChild>
                    <div
                      className={cn(
                        !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          "text-muted-foreground bg-accent/50",
                        "flex h-14 flex-col border-b border-r py-2 px-2 cursor-pointer",
                      )}
                      onClick={() => setSelectedDay(day)}
                    >
                      <span
                        className={cn(
                          isToday(day) && "bg-black text-white",
                          "ml-auto flex h-6 w-6 items-center justify-center text-xs rounded-full",
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {hasEvents && (
                        <div className="mt-1 flex justify-center">
                          <span className="h-1 w-1 rounded-full bg-primary"></span>
                          {dayEvents.length > 1 && (
                            <span className="h-1 w-1 rounded-full bg-primary ml-1"></span>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  
                  {hasEvents && (
                    <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
                      <DialogHeader>
                        <div className="flex items-center justify-between">
                          <DialogTitle>
                            {format(day, "EEEE, MMMM d")}
                          </DialogTitle>
                          <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </DialogClose>
                        </div>
                        <DialogDescription>
                          {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} on this day
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-3 py-2">
                        {dayEvents.map((event, idx) => (
                          <div 
                            key={`${event.id}-${idx}`}
                            className="border rounded-md p-3 hover:bg-accent/50 cursor-pointer"
                            onClick={() => {
                              handleEventClick(event.id);
                            }}
                          >
                            <div className="font-medium">{event.name}</div>
                            <div className="text-muted-foreground text-sm">{event.time}</div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
