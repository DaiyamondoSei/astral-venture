
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-quantum-900 to-quantum-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-display">Quanex</h1>
          <div className="flex space-x-4">
            <Link 
              to="/login"
              className="px-4 py-2 border border-quantum-400 text-quantum-300 hover:bg-quantum-800/30 transition-colors rounded-md"
            >
              Login
            </Link>
            <Link 
              to="/register"
              className="px-4 py-2 bg-quantum-500 hover:bg-quantum-400 transition-colors rounded-md"
            >
              Sign Up
            </Link>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-5xl md:text-6xl font-display font-medium mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Explore Your Quantum Consciousness
          </motion.h2>
          
          <motion.p 
            className="text-xl text-quantum-200 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Discover profound connections between your inner energy, emotions, and the universal consciousness through 
            chakra analysis, dream exploration, and meditation.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link 
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-quantum-500 to-quantum-600 hover:from-quantum-400 hover:to-quantum-500 transition-all rounded-lg shadow-lg shadow-quantum-500/20 text-white font-medium"
            >
              Begin Your Journey <ArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </main>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard 
            title="Chakra Analysis"
            description="Discover your energy centers and learn how to balance them for optimal well-being."
            delay={0.5}
          />
          
          <FeatureCard 
            title="Dream Journal"
            description="Record and analyze your dreams to unlock subconscious insights and patterns."
            delay={0.7}
          />
          
          <FeatureCard 
            title="Meditation Practice"
            description="Guided meditation sessions tailored to your energy profile and consciousness level."
            delay={0.9}
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; description: string; delay: number }> = ({ title, description, delay }) => (
  <motion.div
    className="bg-quantum-800/30 backdrop-blur-sm p-6 rounded-lg border border-quantum-700/30"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <h3 className="text-xl font-medium mb-3">{title}</h3>
    <p className="text-quantum-300">{description}</p>
  </motion.div>
);

export default LandingPage;
