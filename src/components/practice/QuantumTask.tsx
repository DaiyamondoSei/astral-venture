
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Practice } from '@/services/practice/practiceService';

interface QuantumTaskProps {
  practice: Practice;
  onComplete: (duration: number, reflection?: string) => void;
  className?: string;
}

const QuantumTask: React.FC<QuantumTaskProps> = ({ 
  practice, 
  onComplete,
  className 
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reflection, setReflection] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  // Start task and record start time
  const startTask = () => {
    setStartTime(Date.now());
  };
  
  // Move to next step
  const nextStep = () => {
    if (currentStep < (practice.instructions?.length || 0) - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Move to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Complete the task
  const completeTask = () => {
    if (!startTime) return;
    
    // Calculate duration in minutes
    const durationMs = Date.now() - startTime;
    const durationMinutes = Math.max(1, Math.round(durationMs / 60000));
    
    setIsCompleted(true);
    onComplete(durationMinutes, reflection);
  };
  
  // Reset the task
  const resetTask = () => {
    setCurrentStep(0);
    setStartTime(null);
    setReflection('');
    setIsCompleted(false);
  };
  
  // Render steps or completion state
  const renderContent = () => {
    if (isCompleted) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Quantum Task Completed</h3>
          <p className="text-white/70 mb-6">
            You've earned {practice.energyPoints} energy points!
          </p>
          <Button 
            variant="outline"
            onClick={resetTask}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Again
          </Button>
        </motion.div>
      );
    }
    
    // If no start time, show intro
    if (!startTime) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold mb-2">{practice.title}</h3>
          <p className="text-white/70 mb-6">{practice.description}</p>
          
          <div className="flex justify-center space-x-4 mb-6">
            <div className="flex items-center text-white/60 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {practice.duration} min
            </div>
            <div className="flex items-center text-purple-300 text-sm">
              <Zap className="h-4 w-4 mr-1" />
              {practice.energyPoints} points
            </div>
          </div>
          
          <Button 
            onClick={startTask}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Begin Task
          </Button>
        </motion.div>
      );
    }
    
    // Show instructions steps
    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            Step {currentStep + 1} of {practice.instructions?.length}
          </h3>
          <p className="text-white/90">
            {practice.instructions?.[currentStep]}
          </p>
        </div>
        
        {/* Navigation between steps */}
        <div className="flex justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {currentStep < (practice.instructions?.length || 0) - 1 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => setCurrentStep((practice.instructions?.length || 0))}
            >
              Continue
            </Button>
          )}
        </div>
        
        {/* Final step - reflection and completion */}
        {currentStep >= (practice.instructions?.length || 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium">Reflection (Optional)</h3>
            <p className="text-white/70 text-sm">
              Share your experience, insights, or observations from this practice:
            </p>
            
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you notice during this practice? Any insights or awareness?"
              className="h-32"
            />
            
            <Button
              onClick={completeTask}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Complete Task
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  };
  
  return (
    <div className={cn(
      "p-6 bg-gray-900/60 backdrop-blur-lg rounded-xl border border-gray-800/50",
      className
    )}>
      {renderContent()}
    </div>
  );
};

export default QuantumTask;
