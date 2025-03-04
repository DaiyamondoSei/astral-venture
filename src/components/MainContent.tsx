
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SeedOfLife from '@/components/SeedOfLife';
import CategoryExperience from '@/components/CategoryExperience';

interface MainContentProps {
  userProfile: any | null;
  onChallengeComplete: (pointsEarned: number) => void;
}

const MainContent = ({ userProfile, onChallengeComplete }: MainContentProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto px-4 py-8"
    >
      {!activeCategory ? (
        <div className="my-16">
          <SeedOfLife className="w-full max-w-3xl mx-auto" onCategorySelect={handleCategorySelect} />
          <div className="text-center mt-8 text-white/70">
            <p>Select a category to begin your practice</p>
          </div>
        </div>
      ) : (
        <div className="my-8 max-w-2xl mx-auto">
          <button 
            onClick={() => setActiveCategory(null)}
            className="mb-6 text-white/70 hover:text-white flex items-center"
          >
            ← Back to Seed of Life
          </button>
          
          <CategoryExperience 
            category={activeCategory} 
            onComplete={onChallengeComplete}
          />
        </div>
      )}
    </motion.div>
  );
};

export default MainContent;
