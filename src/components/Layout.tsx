
import React from 'react';
import Navbar from './Navbar';
import { useTheme } from '@/context/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, fullWidth = false }) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  return (
    <div className={`min-h-screen bg-background flex flex-col`}>
      <Navbar />
      <main className="flex-1">
        <div className={fullWidth ? "w-full" : "container mx-auto px-4 py-6"}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
