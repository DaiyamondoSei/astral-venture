import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';

interface EntryAnimationViewProps {
  progress: number;
  message?: string;
  onComplete?: () => void;
  showAnimation?: boolean;
}

const EntryAnimationView: React.FC<EntryAnimationViewProps> = ({
  progress,
  message = "Loading...",
  onComplete,
  showAnimation = true
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setLoading(false);
        onComplete && onComplete();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const finishLoading = () => {
    setLoading(false);
    onComplete && onComplete();
  };

  const renderLoadingScreen = () => {
    if (loading) {
      return <LoadingScreen onComplete={finishLoading} />;
    }
    return null;
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {renderLoadingScreen()}
      {!loading && (
        <motion.div className="text-center" variants={itemVariants}>
          <h1 className="text-4xl font-bold text-white mb-4">
            {message}
          </h1>
          <p className="text-lg text-gray-300">
            Completed!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EntryAnimationView;
