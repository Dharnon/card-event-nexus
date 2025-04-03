
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Menu, X, LogIn, User, Store, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary font-medium' : 'text-foreground hover:text-primary';
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
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl shadow-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center shine-effect">
              <CalendarDays className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gradient">MagicEvents</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`${isActive('/')} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>
              Home
            </Link>
            <Link to="/events" className={`${isActive('/events')} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>
              Events
            </Link>
            <Link to="/calendar" className={`${isActive('/calendar')} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>
              Calendar
            </Link>
            
            {user?.role === 'store' && (
              <Link to="/create-event" className={`${isActive('/create-event')} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>
                Create Event
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link to="/admin" className={`${isActive('/admin')} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>
                Admin Dashboard
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-2 relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                      ) : (
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      )}
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
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {getUserIcon()}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  {user.role === 'store' && (
                    <DropdownMenuItem asChild>
                      <Link to="/my-events" className="cursor-pointer">My Events</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm" className="ml-2 shadow-md shadow-primary/20">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Button>
              </Link>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-foreground hover:text-primary">
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
        <div className="md:hidden bg-card/95 backdrop-blur-xl pb-4 px-4 border-b border-border/50">
          <div className="flex flex-col space-y-1 pt-1">
            <Link 
              to="/" 
              className={`${isActive('/')} px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className={`${isActive('/events')} px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              to="/calendar" 
              className={`${isActive('/calendar')} px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Calendar
            </Link>
            
            {user?.role === 'store' && (
              <Link 
                to="/create-event" 
                className={`${isActive('/create-event')} px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Create Event
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`${isActive('/admin')} px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            
            {user ? (
              <>
                <div className="px-3 py-3 mt-2 border-t border-border/50">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 bg-primary text-primary-foreground mr-3">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                      ) : (
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize flex items-center">
                        {getUserIcon()}
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>
                <Link 
                  to="/profile" 
                  className="text-foreground hover:text-primary px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {user.role === 'store' && (
                  <Link 
                    to="/my-events" 
                    className="text-foreground hover:text-primary px-3 py-2 rounded-md text-base font-medium"
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
                  className="text-left text-destructive hover:bg-destructive/10 px-3 py-2 rounded-md text-base font-medium flex items-center w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="mt-2 flex items-center justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button variant="default" className="w-full shadow-md shadow-primary/20">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
