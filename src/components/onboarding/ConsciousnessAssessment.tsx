
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import MetatronsCube from '@/components/visual-foundation/metatrons-cube/MetatronsCube';
import { generateSampleMetatronsData } from '@/components/visual-foundation/metatrons-cube/cubeUtils';

const questions = [
  {
    id: 'q1',
    question: 'How often do you feel a sense of connection to something larger than yourself?',
    options: [
      { id: 'q1-1', label: 'Rarely or never', value: 1 },
      { id: 'q1-2', label: 'Occasionally', value: 2 },
      { id: 'q1-3', label: 'Frequently', value: 3 },
      { id: 'q1-4', label: 'Almost always', value: 4 }
    ]
  },
  {
    id: 'q2',
    question: 'How would you describe your ability to be present in the current moment?',
    options: [
      { id: 'q2-1', label: 'I'm often distracted by thoughts of past or future', value: 1 },
      { id: 'q2-2', label: 'I'm sometimes able to be present', value: 2 },
      { id: 'q2-3', label: 'I'm frequently able to be present', value: 3 },
      { id: 'q2-4', label: 'I live mostly in the present moment', value: 4 }
    ]
  },
  {
    id: 'q3',
    question: 'How do you typically respond to challenging situations?',
    options: [
      { id: 'q3-1', label: 'With stress and reactivity', value: 1 },
      { id: 'q3-2', label: 'With some emotional control', value: 2 },
      { id: 'q3-3', label: 'With patience and perspective', value: 3 },
      { id: 'q3-4', label: 'With equanimity and compassion', value: 4 }
    ]
  }
];

export function ConsciousnessAssessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const { nodes, connections } = generateSampleMetatronsData(7);

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeAssessment = () => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const maxPossibleScore = questions.length * 4;
    const percentage = Math.round((totalScore / maxPossibleScore) * 100);
    
    // Save assessment result to local storage
    localStorage.setItem('initialAssessmentCompleted', 'true');
    localStorage.setItem('consciousnessScore', percentage.toString());
    
    toast({
      title: "Assessment Complete",
      description: `Your consciousness score: ${percentage}%. Your journey begins now.`,
    });
    
    // Redirect to dashboard or next onboarding step
    navigate('/dashboard');
  };

  const currentQ = questions[currentQuestion];
  const hasAnsweredCurrent = Boolean(answers[currentQ.id]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Consciousness Assessment</h2>
        <p className="text-white/80">
          Answer these questions to help us understand your current state of consciousness.
        </p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="w-40 h-40">
          <MetatronsCube 
            nodes={nodes} 
            connections={connections}
            variant="cosmic"
            withAnimation={true}
          />
        </div>
      </div>
      
      <Card className="p-6 bg-black/20 backdrop-blur-md border-white/10">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-white">
              {currentQ.question}
            </h3>
            <p className="text-sm text-white/60">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          
          <RadioGroup 
            onValueChange={(value) => handleAnswerChange(currentQ.id, parseInt(value))}
            value={answers[currentQ.id]?.toString()}
          >
            <div className="space-y-3">
              {currentQ.options.map(option => (
                <div 
                  key={option.id} 
                  className="flex items-center space-x-2 p-3 rounded-md hover:bg-white/5 transition-colors"
                >
                  <RadioGroupItem value={option.value.toString()} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {currentQuestion < questions.length - 1 ? 'Next' : 'Complete'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ConsciousnessAssessment;
