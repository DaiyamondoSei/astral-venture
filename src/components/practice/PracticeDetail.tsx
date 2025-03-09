
import React, { useState } from 'react';
import { ArrowLeft, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Practice } from '@/services/practice/practiceService';
import MeditationTimer from './MeditationTimer';
import QuantumTask from './QuantumTask';
import { motion } from 'framer-motion';

// Chakra color mapping
const chakraColors: Record<string, string> = {
  root: '#FF5757',
  sacral: '#FF9E43',
  solar: '#FFDE59',
  heart: '#7ED957',
  throat: '#5CC9F5',
  'third-eye': '#A85CFF',
  crown: '#C588FF'
};

interface PracticeDetailProps {
  practice: Practice;
  onBack: () => void;
  onComplete: (duration: number, reflection?: string) => void;
  className?: string;
}

const PracticeDetail: React.FC<PracticeDetailProps> = ({
  practice,
  onBack,
  onComplete,
  className
}) => {
  const [showPractice, setShowPractice] = useState(false);
  
  // Get chakra colors from practice if available
  const practiceChakraColors = practice.chakraAssociation?.map(
    chakra => chakraColors[chakra]
  ) || [];
  
  // Start the practice
  const startPractice = () => {
    setShowPractice(true);
  };
  
  // Render appropriate practice component based on type
  const renderPracticeComponent = () => {
    switch (practice.type) {
      case 'meditation':
        return (
          <MeditationTimer
            initialDuration={practice.duration}
            onComplete={onComplete}
            chakraColors={practiceChakraColors}
          />
        );
      case 'quantum-task':
      case 'integration':
        return (
          <QuantumTask
            practice={practice}
            onComplete={onComplete}
          />
        );
      default:
        return <div>Unknown practice type</div>;
    }
  };
  
  return (
    <div className={cn(
      "space-y-6",
      className
    )}>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <h2 className="text-xl font-semibold flex-grow">{practice.title}</h2>
      </div>
      
      {!showPractice ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 backdrop-blur-lg rounded-xl border border-gray-800/50 p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{practice.title}</h3>
              <p className="text-white/70 text-sm">{practice.type === 'quantum-task' ? 'Quantum Task' : practice.type === 'integration' ? 'Integration Practice' : 'Meditation'}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-white/60 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {practice.duration} min
              </div>
              <div className="flex items-center text-purple-300 text-sm">
                <Zap className="h-4 w-4 mr-1" />
                {practice.energyPoints} points
              </div>
            </div>
          </div>
          
          <p className="text-white/80 mb-6">{practice.description}</p>
          
          {/* Chakra associations */}
          {practice.chakraAssociation && practice.chakraAssociation.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Chakra Association:</h4>
              <div className="flex flex-wrap gap-2">
                {practice.chakraAssociation.map(chakra => (
                  <div 
                    key={chakra}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${chakraColors[chakra]}30`,
                      color: chakraColors[chakra]
                    }}
                  >
                    {chakra.charAt(0).toUpperCase() + chakra.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Instructions overview */}
          {practice.instructions && practice.instructions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Instructions:</h4>
              <ul className="list-disc list-inside text-white/70 space-y-1">
                {practice.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm">
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button 
            onClick={startPractice}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Begin Practice
          </Button>
        </motion.div>
      ) : (
        <div>
          {renderPracticeComponent()}
        </div>
      )}
    </div>
  );
};

export default PracticeDetail;
