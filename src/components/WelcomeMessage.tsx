
import React from 'react';
import { motion } from 'framer-motion';

const WelcomeMessage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-display font-medium mb-4 text-white glow-text"
        >
          Welcome to Quanex
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-white/80"
        >
          Your journey to expanded consciousness begins here
        </motion.p>
      </div>
    </div>
  );
};

export default WelcomeMessage;
