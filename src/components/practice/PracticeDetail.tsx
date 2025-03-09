
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Zap, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Practice } from '@/services/practice/practiceService';
import MeditationTimer from './MeditationTimer';
import QuantumTask from './QuantumTask';
import { cn } from '@/lib/utils';

interface PracticeDetailProps {
  practice: Practice;
  onBack: () => void;
  onComplete: (duration: number, reflection?: string) => Promise<boolean>;
  className?: string;
}

const PracticeDetail: React.FC<PracticeDetailProps> = ({
  practice,
  onBack,
  onComplete,
  className
}) => {
  const [reflection, setReflection] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  
  const handleMeditationComplete = async (duration: number) => {
    setIsCompleting(true);
    try {
      await onComplete(duration, reflection);
    } catch (error) {
      console.error('Error completing meditation:', error);
    } finally {
      setIsCompleting(false);
    }
  };
  
  const handleTaskComplete = async (taskReflection?: string) => {
    setIsCompleting(true);
    try {
      await onComplete(practice.duration, taskReflection);
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
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mr-3 text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-display font-bold text-white/90">{practice.title}</h2>
      </div>
      
      {/* Practice details */}
      <div className="mb-6">
        <p className="text-white/70 mb-4">{practice.description}</p>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center bg-gray-800/40 px-3 py-1 rounded-full text-white/70 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {practice.duration} minutes
          </div>
          <div className="flex items-center bg-purple-900/40 px-3 py-1 rounded-full text-purple-300 text-sm">
            <Zap className="h-4 w-4 mr-1" />
            {practice.energyPoints} energy points
          </div>
          <div className="flex items-center bg-blue-900/40 px-3 py-1 rounded-full text-blue-300 text-sm">
            <Award className="h-4 w-4 mr-1" />
            Level {practice.level}
          </div>
          {practice.chakraAssociation && practice.chakraAssociation.length > 0 && (
            <div className="flex items-center bg-indigo-900/40 px-3 py-1 rounded-full text-indigo-300 text-sm">
              <Target className="h-4 w-4 mr-1" />
              {practice.chakraAssociation.join(', ')} Chakra
            </div>
          )}
        </div>
      </div>
      
      {/* Practice content */}
      {practice.type === 'meditation' ? (
        <div className="flex flex-col items-center justify-center space-y-6">
          <MeditationTimer
            initialDuration={practice.duration}
            onComplete={handleMeditationComplete}
          />
          
          {/* Reflection textarea */}
          <div className="w-full">
            <h3 className="font-medium mb-2 text-white/80">Post-Meditation Reflection</h3>
            <textarea
              className="w-full p-3 bg-gray-800/40 border border-gray-700/50 rounded-lg text-white/80 resize-none focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
              placeholder="Share your insights from this meditation..."
              rows={4}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              disabled={isCompleting}
            />
            <p className="text-xs text-white/50 mt-2">Reflecting on your experience deepens the practice and increases energy points.</p>
          </div>
        </div>
      ) : (
        <QuantumTask
          id={practice.id}
          title={practice.title}
          description={practice.description}
          duration={practice.duration}
          energyPoints={practice.energyPoints}
          instructions={practice.instructions}
          onComplete={handleTaskComplete}
        />
      )}
    </motion.div>
  );
};

export default PracticeDetail;
