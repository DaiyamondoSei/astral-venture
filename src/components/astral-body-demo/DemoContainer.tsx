
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
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </motion.div>
  );
};

export default DemoContainer;
