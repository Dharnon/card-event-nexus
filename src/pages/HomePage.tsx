
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Search, Store, Users, Sparkles, MapPin, Clock } from 'lucide-react';
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
        {/* Hero Section with Animated Background */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614066737967-8213e250be9d?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background to-background"></div>
          
          <div className="relative py-20 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6 tracking-tight">
                Discover Magic: The Gathering Events
              </h1>
              <p className="text-xl text-foreground/80 mb-8 max-w-3xl mx-auto">
                Find tournaments, casual play sessions, and special events in your area. 
                Join the community and play the game you love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/events">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <Search className="mr-2 h-5 w-5" />
                    Browse Events
                  </Button>
                </Link>
                <Link to="/calendar">
                  <Button size="lg" variant="outline" className="bg-background/50 backdrop-blur-sm text-foreground border-primary hover:bg-primary/10">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    View Calendar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Feature cards */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="magic-card glass-morphism shadow-xl transform transition-all hover:translate-y-[-5px]">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="bg-primary/20 p-3 rounded-lg mr-4">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Find Events</h3>
                      <p className="text-muted-foreground">
                        Discover tournaments and casual play opportunities in your area. Filter by format, location, and date.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="magic-card glass-morphism shadow-xl transform transition-all hover:translate-y-[-5px]">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="bg-primary/20 p-3 rounded-lg mr-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Join the Community</h3>
                      <p className="text-muted-foreground">
                        Register for events, connect with other players, and become part of the Magic community.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="magic-card glass-morphism shadow-xl transform transition-all hover:translate-y-[-5px]">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="bg-primary/20 p-3 rounded-lg mr-4">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">For Stores</h3>
                      <p className="text-muted-foreground">
                        Are you a store owner? Create and manage your Magic events to attract more players to your venue.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Featured Event Section */}
        {featuredEvents.length > 0 && (
          <section className="py-16 bg-secondary/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-500" /> Featured Event
                </h2>
                <p className="text-muted-foreground">Don't miss this special event</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center glass-morphism p-6 rounded-xl">
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
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-primary mr-2" />
                      <span>{new Date(featuredEvents[0].startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-primary mr-2" />
                      <span>{featuredEvents[0].location.city}</span>
                    </div>
                  </div>
                  
                  <Link to={`/events/${featuredEvents[0].id}`}>
                    <Button className="w-full sm:w-auto">View Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Upcoming Events Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Upcoming Events</h2>
                <p className="text-muted-foreground">Don't miss these events happening soon</p>
              </div>
              <Link to="/events">
                <Button variant="outline" className="backdrop-blur-sm hover:bg-primary/10">View All Events</Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="magic-card h-64 animate-pulse">
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
              <div className="glass-morphism text-center py-16 rounded-xl">
                <p className="text-muted-foreground mb-4">No upcoming events found</p>
                <Link to="/events">
                  <Button variant="outline" className="backdrop-blur-sm hover:bg-primary/10">Browse all events</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-magic-purple/30 to-magic-lightPurple/30 opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to join the gathering?</h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
              Whether you're a player looking for events or a store wanting to host tournaments, MagicEvents has you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="shadow-lg shadow-primary/20">Get Started</Button>
              </Link>
              <Link to="/events">
                <Button size="lg" variant="outline" className="bg-background/50 backdrop-blur-sm hover:bg-primary/10">
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
