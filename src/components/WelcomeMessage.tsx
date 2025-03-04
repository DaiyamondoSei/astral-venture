
import React from 'react';
import { motion } from 'framer-motion';

const WelcomeMessage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const glowVariants = {
    initial: { boxShadow: "0 0 10px rgba(138, 92, 246, 0.3)" },
    animate: { 
      boxShadow: "0 0 25px rgba(138, 92, 246, 0.7)",
      transition: { 
        duration: 2, 
        repeat: Infinity, 
        repeatType: "reverse" 
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <motion.div 
        className="max-w-4xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="inline-block mb-6 p-4 rounded-full"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-quantum-400 to-quantum-700 rounded-full"
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, repeatType: "reverse" }
            }}
          />
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium mb-4 text-white glow-text"
        >
          Welcome to Quanex
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-base sm:text-lg md:text-xl text-white/80 mb-6"
        >
          Your journey to expanded consciousness begins here
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-2 items-center"
        >
          {["Discover", "Connect", "Transcend"].map((word, index) => (
            <motion.span 
              key={index}
              className="px-4 py-2 rounded-full text-sm md:text-base bg-quantum-700/50 text-white/90"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "rgba(62, 33, 130, 0.8)",
                transition: { duration: 0.2 } 
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeMessage;
