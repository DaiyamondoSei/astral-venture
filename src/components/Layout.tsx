
import React from 'react';
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background particles/orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="orb w-96 h-96 -top-20 -left-20 from-quantum-300/30 to-quantum-500/10" />
        <div className="orb w-96 h-96 top-1/4 -right-20 from-astral-300/20 to-astral-500/5" />
        <div className="orb w-80 h-80 bottom-1/4 -left-20 from-ethereal-300/20 to-ethereal-500/5" />
        
        {/* Wave animation at bottom */}
        <div className="wave-container">
          <div className="wave wave-1" />
          <div className="wave wave-2" />
          <div className="wave wave-3" />
        </div>
      </div>
      
      <main className={cn("container mx-auto px-4 py-8 relative z-0", className)}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
