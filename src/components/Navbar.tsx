
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Menu, X, LogIn, User, Store, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getUserIcon = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'admin':
        return <Shield className="mr-2 h-4 w-4" />;
      case 'store':
        return <Store className="mr-2 h-4 w-4" />;
      default:
        return <User className="mr-2 h-4 w-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <CalendarClock className="h-8 w-8 text-magic-purple" />
              <span className="ml-2 text-xl font-semibold text-magic-purple">MagicEvents</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link to="/events" className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-sm font-medium">
              Events
            </Link>
            <Link to="/calendar" className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-sm font-medium">
              Calendar
            </Link>
            
            {user?.role === 'store' && (
              <Link to="/create-event" className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-sm font-medium">
                Create Event
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-sm font-medium">
                Admin Dashboard
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 bg-magic-purple text-white">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {getUserIcon()}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {user.role === 'store' && (
                    <DropdownMenuItem asChild>
                      <Link to="/my-events">My Events</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="outline" className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Button>
              </Link>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-gray-500 hover:text-magic-purple">
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card pb-3 px-4">
          <div className="flex flex-col space-y-2">
            <Link 
              to="/" 
              className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              to="/calendar" 
              className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Calendar
            </Link>
            
            {user?.role === 'store' && (
              <Link 
                to="/create-event" 
                className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Event
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            
            {user ? (
              <>
                <div className="px-3 py-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 bg-magic-purple text-white mr-2">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
                <Link 
                  to="/profile" 
                  className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {user.role === 'store' && (
                  <Link 
                    to="/my-events" 
                    className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Events
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-destructive hover:text-destructive px-3 py-2 rounded-md text-base font-medium flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-foreground hover:text-magic-purple px-3 py-2 rounded-md text-base font-medium flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
