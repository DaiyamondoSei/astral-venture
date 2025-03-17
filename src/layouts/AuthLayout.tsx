
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import GlowEffect from '@/shared/components/visual/GlowEffect';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-quantum-900 to-quantum-950 text-white flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative p-8 bg-quantum-800/50 backdrop-blur-lg rounded-lg shadow-xl">
            <GlowEffect className="absolute inset-0 rounded-lg" color="rgba(120, 60, 220, 0.15)" />
            <Outlet />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout;
