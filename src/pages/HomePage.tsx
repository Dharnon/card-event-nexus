
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Search, Users, Sparkles, MapPin, Clock, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import { useEvents } from '@/context/EventContext';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const HomePage = () => {
  const { events, isLoading } = useEvents();
  
  // Get upcoming events (next 3)
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .filter(event => new Date(event.startDate) >= new Date())
    .slice(0, 3);
  
  // Get featured events
  const featuredEvents = events.filter(event => event.featured).slice(0, 1);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section - Simplified */}
        <section className="relative py-10 md:py-16 bg-background">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Find <span className="text-primary">Magic: The Gathering</span> Events
            </h1>
            <p className="text-xl text-foreground/80 mb-8 max-w-3xl mx-auto">
              Find tournaments, casual play sessions, and special events in your area. 
              Join the community and play the game you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events">
                <Button size="lg">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Events
                </Button>
              </Link>
              <Link to="/calendar">
                <Button size="lg" variant="outline">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  View Calendar
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Feature cards - Simplified */}
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center md:items-start md:flex-row md:space-x-4">
                    <div className="bg-primary p-4 rounded-lg mb-4 md:mb-0">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="font-semibold text-lg mb-2">Find Events</h3>
                      <p className="text-muted-foreground">
                        Discover tournaments and casual play opportunities in your area.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center md:items-start md:flex-row md:space-x-4">
                    <div className="bg-primary p-4 rounded-lg mb-4 md:mb-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="font-semibold text-lg mb-2">Join the Community</h3>
                      <p className="text-muted-foreground">
                        Register for events and connect with other players.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center md:items-start md:flex-row md:space-x-4">
                    <div className="bg-primary p-4 rounded-lg mb-4 md:mb-0">
                      <CalendarDays className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="font-semibold text-lg mb-2">Event Calendar</h3>
                      <p className="text-muted-foreground">
                        View upcoming events and plan your gaming schedule.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Featured Event Section - Simplified */}
        {featuredEvents.length > 0 && (
          <section className="py-16 bg-accent/30">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold">Featured Event</h2>
                <p className="text-muted-foreground">Special events you don't want to miss</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center p-6 rounded-xl border">
                <div className="lg:col-span-2">
                  <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden">
                    {featuredEvents[0].image ? (
                      <img 
                        src={featuredEvents[0].image} 
                        alt={featuredEvents[0].title} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </AspectRatio>
                </div>
                <div className="lg:col-span-3">
                  <h3 className="text-2xl font-bold mb-3">{featuredEvents[0].title}</h3>
                  <p className="text-foreground/80 mb-4 line-clamp-3">{featuredEvents[0].description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center p-3 rounded-lg bg-card shadow-sm">
                      <Clock className="h-5 w-5 text-primary mr-2" />
                      <span>{new Date(featuredEvents[0].startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg bg-card shadow-sm">
                      <MapPin className="h-5 w-5 text-primary mr-2" />
                      <span>{featuredEvents[0].location.city}</span>
                    </div>
                  </div>
                  
                  <Link to={`/events/${featuredEvents[0].id}`}>
                    <Button>
                      View Details
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Upcoming Events Section - Simplified */}
        <section className="py-16">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Upcoming Events</h2>
                <p className="text-muted-foreground">Don't miss these events happening soon</p>
              </div>
              <Link to="/events">
                <Button variant="outline">
                  View All Events
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-64 animate-pulse">
                    <CardContent className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground/50">Loading...</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-xl border">
                <Star className="h-10 w-10 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No upcoming events found</p>
                <Link to="/events">
                  <Button variant="outline">
                    Browse all events
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
        
        {/* Call to Action - Simplified */}
        <section className="py-16">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to join the gathering?</h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
              Whether you're a player looking for events or a store wanting to host tournaments, MagicEvents has you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/events">
                <Button size="lg" variant="outline">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
