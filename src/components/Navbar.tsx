
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { 
  User, 
  Calendar, 
  Store, 
  Search,
  PlusCircle,
  Settings,
  LogOut,
  Heart
} from "lucide-react";
import { Input } from "./ui/input";
import { Dialog, DialogContent } from "./ui/dialog";
import GameLifeTracker from "./profile/GameLifeTracker";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [lifeCounterOpen, setLifeCounterOpen] = useState(false);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6 sm:gap-10">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-xl">Tier1Games</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                to="/events"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Events
              </Link>
              <Link
                to="/calendar"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Calendar
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center w-full max-w-sm mx-8">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                className="w-full pl-8 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Life Counter Quick Access */}
            {user && (
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full" 
                onClick={() => setLifeCounterOpen(true)}
              >
                <Heart className="h-5 w-5 text-red-500" />
              </Button>
            )}
            
            {/* Theme toggle visible on all screen sizes */}
            <ThemeToggle />
            
            {/* Language selector hidden on small screens */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.name || "User"} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Decks</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/calendar")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Calendar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/store")}>
                    <Store className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/events/create")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Create Event</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLifeCounterOpen(true)}>
                    <Heart className="mr-2 h-4 w-4 text-red-500" />
                    <span>Life Counter</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/events")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Manage Events</span>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin}>Login</Button>
            )}
          </div>
        </div>
      </header>

      {/* Life Counter Dialog */}
      <Dialog open={lifeCounterOpen} onOpenChange={setLifeCounterOpen}>
        <DialogContent className="p-0 sm:max-w-[400px] h-[80vh]">
          <GameLifeTracker
            deckId="quickaccess"
            onGameEnd={() => setLifeCounterOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
