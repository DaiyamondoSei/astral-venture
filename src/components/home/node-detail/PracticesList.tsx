
import React from 'react';
import { motion } from 'framer-motion';

interface PracticesListProps {
  practices: string[];
}

const PracticesList: React.FC<PracticesListProps> = ({ practices }) => {
  return (
    <>
      <h3 className="text-lg font-display mb-3">Practices</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {practices.map((practice, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            className="bg-black/20 p-3 rounded-lg"
          >
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-quantum-500/20 flex items-center justify-center mr-2">
                {index + 1}
              </div>
              <span>{practice}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default PracticesList;
