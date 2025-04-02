
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Search, Store, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import { useEvents } from '@/context/EventContext';

const HomePage = () => {
  const { events, isLoading } = useEvents();
  
  // Get upcoming events (next 3)
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .filter(event => new Date(event.startDate) >= new Date())
    .slice(0, 3);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative">
          <div className="magic-gradient-bg py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Discover Magic: The Gathering Events
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
                Find tournaments, casual play sessions, and special events in your area. 
                Join the community and play the game you love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/events">
                  <Button size="lg" className="bg-white text-magic-purple hover:bg-white/90">
                    <Search className="mr-2 h-5 w-5" />
                    Browse Events
                  </Button>
                </Link>
                <Link to="/calendar">
                  <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
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
              <Card className="magic-card shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="bg-magic-purple/10 p-3 rounded-lg mr-4">
                      <Search className="h-6 w-6 text-magic-purple" />
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
              
              <Card className="magic-card shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="bg-magic-purple/10 p-3 rounded-lg mr-4">
                      <Users className="h-6 w-6 text-magic-purple" />
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
              
              <Card className="magic-card shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="bg-magic-purple/10 p-3 rounded-lg mr-4">
                      <Store className="h-6 w-6 text-magic-purple" />
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
        
        {/* Upcoming Events Section */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Upcoming Events</h2>
                <p className="text-muted-foreground">Don't miss these events happening soon</p>
              </div>
              <Link to="/events">
                <Button variant="outline">View All Events</Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading events...</p>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No upcoming events found</p>
                <Link to="/events">
                  <Button variant="link">Browse all events</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="bg-muted py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to join the gathering?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
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
