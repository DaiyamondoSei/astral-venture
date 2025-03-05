
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DemoContainerProps {
  children: ReactNode;
}

/**
 * DemoContainer component
 * 
 * Provides the animation and layout container for the AstralBodyDemo page
 */
const DemoContainer: React.FC<DemoContainerProps> = ({ children }) => {
  return (
    <motion.div 
      className="container mx-auto px-4 py-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative orbs */}
      <div className="absolute top-20 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-quantum-400/10 to-quantum-600/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-40 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-astral-400/10 to-astral-600/5 blur-3xl pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default DemoContainer;
