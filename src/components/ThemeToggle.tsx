
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="rounded-full relative overflow-hidden group z-10"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="sr-only">Toggle theme</span>
      <span className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`}>
        <Sun className="h-5 w-5 text-amber-300" />
      </span>
      <span className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
        <Moon className="h-5 w-5 text-indigo-400" />
      </span>
    </Button>
  );
};

export default ThemeToggle;
