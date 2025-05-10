
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
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
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
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl shadow-sm border-b border-border/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center shine-effect group">
              <div className="bg-primary/10 p-2 rounded-full transition-all duration-300 group-hover:bg-primary/20">
                <CalendarDays className="h-7 w-7 text-primary" />
              </div>
              <span className="ml-2 text-xl font-bold text-gradient">MagicEvents</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>
              Events
            </Link>
            <Link to="/calendar" className={`nav-link ${isActive('/calendar') ? 'active' : ''}`}>
              Calendar
            </Link>
            
            {user?.role === 'store' && (
              <Link to="/events/create" className={`nav-link ${isActive('/events/create') ? 'active' : ''}`}>
                Create Event
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                Admin Dashboard
              </Link>
            )}
            
            <div className="ml-2">
              <ThemeToggle />
            </div>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-2 relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <Avatar className="h-8 w-8 bg-primary/90 text-primary-foreground">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                      ) : (
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
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
                      <Link to="/store" className="cursor-pointer">Store Dashboard</Link>
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
                <Button variant="default" size="sm" className="ml-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Button>
              </Link>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button onClick={toggleMenu} className="text-foreground hover:text-primary ml-2 p-2 rounded-full hover:bg-primary/10 transition-colors">
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
        <div className="md:hidden bg-card/95 backdrop-blur-xl pb-4 px-4 border-b border-border/30 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-1 pt-1">
            <Link 
              to="/" 
              className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/') ? 'text-primary bg-primary/10' : 'hover:bg-primary/5'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/events') ? 'text-primary bg-primary/10' : 'hover:bg-primary/5'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              to="/calendar" 
              className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/calendar') ? 'text-primary bg-primary/10' : 'hover:bg-primary/5'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Calendar
            </Link>
            
            {user?.role === 'store' && (
              <Link 
                to="/events/create" 
                className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/events/create') ? 'text-primary bg-primary/10' : 'hover:bg-primary/5'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Create Event
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`px-3 py-3 rounded-md text-base font-medium ${isActive('/admin') ? 'text-primary bg-primary/10' : 'hover:bg-primary/5'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            
            {user ? (
              <>
                <div className="px-3 py-4 mt-2 border-t border-border/30 rounded-md">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 bg-primary/90 text-primary-foreground mr-3 border-2 border-primary/30">
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
                  className="px-3 py-3 rounded-md text-base font-medium hover:bg-primary/5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {user.role === 'store' && (
                  <Link 
                    to="/store" 
                    className="px-3 py-3 rounded-md text-base font-medium hover:bg-primary/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Store Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-destructive hover:bg-destructive/10 px-3 py-3 rounded-md text-base font-medium flex items-center w-full"
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
