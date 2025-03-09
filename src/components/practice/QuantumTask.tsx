
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Timer, Zap, Brain, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuantumTaskProps {
  id: string;
  title: string;
  description: string;
  duration: number;
  energyPoints: number;
  instructions?: string[];
  onComplete: (reflection?: string) => Promise<void>;
  className?: string;
}

const QuantumTask: React.FC<QuantumTaskProps> = ({
  id,
  title,
  description,
  duration,
  energyPoints,
  instructions = [],
  onComplete,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [reflection, setReflection] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  
  const handleNext = () => {
    if (currentStep < instructions.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleTaskComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(reflection);
      setIsCompleted(true);
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setIsCompleting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("p-6 rounded-xl bg-black/30 border border-gray-700/30", className)}
    >
      {/* Task Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold mb-2 text-white/90">{title}</h2>
        <p className="text-white/70">{description}</p>
        
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center bg-gray-800/40 px-3 py-1 rounded-full text-white/70 text-sm">
            <Timer className="h-4 w-4 mr-1" />
            {duration} minutes
          </div>
          <div className="flex items-center bg-purple-900/40 px-3 py-1 rounded-full text-purple-300 text-sm">
            <Zap className="h-4 w-4 mr-1" />
            {energyPoints} energy points
          </div>
        </div>
      </div>
      
      {!isCompleted ? (
        <>
          {/* Instructions */}
          {instructions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-white/80 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Instructions ({currentStep + 1}/{instructions.length})
              </h3>
              
              <motion.div 
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/40 p-4 rounded-lg mb-3"
              >
                <p className="text-white/80">{instructions[currentStep]}</p>
              </motion.div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="bg-transparent border-gray-700"
                >
                  Previous
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNext}
                  disabled={currentStep === instructions.length - 1}
                  className="bg-transparent border-gray-700"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          
          {/* Reflection Input */}
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-white/80 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Your Reflection
            </h3>
            <textarea
              className="w-full p-3 bg-gray-800/40 border border-gray-700/50 rounded-lg text-white/80 resize-none focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
              placeholder="Share your insights from this practice..."
              rows={4}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
            <p className="text-xs text-white/50 mt-2">Reflecting on your practice deepens the experience and increases energy points.</p>
          </div>
          
          {/* Complete Button */}
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={handleTaskComplete}
            disabled={isCompleting}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isCompleting ? "Completing..." : "Complete Task"}
          </Button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="h-8 w-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">Task Completed!</h3>
          <p className="text-white/70 mb-6">
            You've earned {energyPoints} energy points for your quantum consciousness journey.
          </p>
          <Button
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={() => window.location.reload()}
          >
            Return to Practice List
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuantumTask;
