
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ConsciousnessQuestion {
  id: string;
  text: string;
  options: {
    value: number;
    label: string;
  }[];
}

interface ConsciousnessAssessmentProps {
  onComplete: (score: number) => void;
  className?: string;
}

const ConsciousnessAssessment: React.FC<ConsciousnessAssessmentProps> = ({ onComplete, className }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  // Fixed the malformed questions array
  const questions: ConsciousnessQuestion[] = [
    {
      id: "q1",
      text: "How often do you experience moments of profound connection with all things?",
      options: [
        { value: 1, label: "Rarely or never" },
        { value: 2, label: "Occasionally" },
        { value: 3, label: "Regularly" },
        { value: 4, label: "Frequently" },
        { value: 5, label: "Almost constantly" }
      ]
    },
    {
      id: "q2",
      text: "When faced with challenges, how do you typically respond?",
      options: [
        { value: 1, label: "With fear and anxiety" },
        { value: 2, label: "By seeking solutions" },
        { value: 3, label: "With curiosity" },
        { value: 4, label: "As opportunities for growth" },
        { value: 5, label: "As perfect unfoldings of consciousness" }
      ]
    },
    {
      id: "q3",
      text: "How would you describe your awareness of subtle energies?",
      options: [
        { value: 1, label: "Non-existent" },
        { value: 2, label: "Occasional sensitivity" },
        { value: 3, label: "Growing awareness" },
        { value: 4, label: "Regular perception" },
        { value: 5, label: "Constant attunement" }
      ]
    }
  ];
  
  const handleSelectOption = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate final score
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const maxPossibleScore = questions.length * 5;
      const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);
      
      toast.success(`Assessment complete! Your consciousness score: ${normalizedScore}%`);
      onComplete(normalizedScore);
    }
  };
  
  const currentQuestionData = questions[currentQuestion];
  const hasAnsweredCurrent = answers[currentQuestionData.id] !== undefined;
  
  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 backdrop-blur-md bg-opacity-20 bg-black/20 border-purple-300/30">
        <h2 className="text-2xl font-semibold text-white mb-6">Consciousness Assessment</h2>
        
        <div className="flex items-center mb-4">
          {questions.map((_, index) => (
            <React.Fragment key={index}>
              <div 
                className={`h-2 w-2 rounded-full ${index === currentQuestion ? 'bg-purple-500' : 'bg-gray-400'}`}
              />
              {index < questions.length - 1 && (
                <div className="h-px w-4 bg-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl text-white mb-4">{currentQuestionData.text}</h3>
          
          <div className="space-y-3">
            {currentQuestionData.options.map((option) => (
              <div
                key={option.value}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  answers[currentQuestionData.id] === option.value
                    ? 'bg-purple-600/50 border border-purple-400'
                    : 'bg-gray-800/30 hover:bg-gray-700/40 border border-gray-700'
                }`}
                onClick={() => handleSelectOption(currentQuestionData.id, option.value)}
              >
                <p className="text-white">{option.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="my-4 bg-gray-600" />
        
        <div className="flex justify-end">
          <Button
            variant="default"
            onClick={handleNextQuestion}
            disabled={!hasAnsweredCurrent}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ConsciousnessAssessment;
