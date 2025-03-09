
import React from 'react';
import { motion } from 'framer-motion';
import PracticePageContent from '@/components/practice/PracticePageContent';

const PracticePage: React.FC = () => {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-6">Quantum Practices</h1>
        <PracticePageContent />
      </motion.div>
    </div>
  );
};

export default PracticePage;
