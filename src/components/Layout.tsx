
import React from 'react';
import { cn } from "@/lib/utils";
import GeometryNetworkBackground from './background/GeometryNetworkBackground';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced background with sacred geometry network animation */}
      <GeometryNetworkBackground density={35} speed={0.6} />
      
      {/* Improved glass background layers with better positioning and animations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* More subtle and positioned orbs */}
        <div className="orb w-[30vw] h-[30vw] -top-[10vw] -left-[10vw] from-quantum-300/20 to-quantum-500/5 animate-pulse-slow" />
        <div className="orb w-[25vw] h-[25vw] top-1/3 -right-[5vw] from-astral-300/15 to-astral-500/5 animate-float" />
        <div className="orb w-[20vw] h-[20vw] bottom-1/3 -left-[5vw] from-ethereal-300/15 to-ethereal-500/5 animate-float" 
             style={{ animationDelay: '-2s' }} />
        
        {/* More prominent wave animation at bottom with enhanced colors */}
        <div className="wave-container">
          <div className="wave wave-1" />
          <div className="wave wave-2" />
          <div className="wave wave-3" />
        </div>
        
        {/* Subtle vignette effect around the edges */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/30 pointer-events-none" />
      </div>
      
      {/* Main content with improved spacing and z-indexing */}
      <main className={cn(
        "container mx-auto px-4 py-8 relative z-10",
        "transition-all duration-500 ease-in-out", 
        className
      )}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
