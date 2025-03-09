
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import MetatronsCube from '@/components/visual-foundation/MetatronsCube';

// Define the assessment questions
const questions = [
  {
    id: 'awareness',
    question: 'How would you rate your self-awareness?',
    options: [
      { value: 1, label: 'Just beginning to explore my inner world' },
      { value: 2, label: 'Sometimes aware of my thoughts and feelings' },
      { value: 3, label: 'Regularly practice self-reflection' },
      { value: 4, label: 'Highly attuned to my inner states' },
      { value: 5, label: 'Deep awareness of subtle energetic shifts within' }
    ]
  },
  {
    id: 'meditation',
    question: 'What is your experience with meditation?',
    options: [
      { value: 1, label: 'Never tried it' },
      { value: 2, label: 'Occasionally meditate' },
      { value: 3, label: 'Regular practice of 1-3 times per week' },
      { value: 4, label: 'Daily practice of 10-20 minutes' },
      { value: 5, label: 'Deep daily practice of 30+ minutes' }
    ]
  },
  {
    id: 'energy',
    question: 'How familiar are you with energy centers (chakras)?',
    options: [
      { value: 1, label: 'Not familiar at all' },
      { value: 2, label: 'Have heard about them' },
      { value: 3, label: 'Basic understanding of their purpose' },
      { value: 4, label: 'Regular work with one or more chakras' },
      { value: 5, label: 'Deep energetic awareness and practice' }
    ]
  },
  {
    id: 'quantum',
    question: 'How do you relate to quantum concepts?',
    options: [
      { value: 1, label: 'Unfamiliar with quantum principles' },
      { value: 2, label: 'Basic understanding of scientific concepts' },
      { value: 3, label: 'See connections between quantum science and consciousness' },
      { value: 4, label: 'Applying quantum thinking in daily life' },
      { value: 5, label: 'Living in quantum awareness regularly' }
    ]
  },
  {
    id: 'synchronicity',
    question: 'How often do you notice meaningful coincidences or synchronicities?',
    options: [
      { value: 1, label: 'Rarely or never' },
      { value: 2, label: 'Occasionally, but view them as random' },
      { value: 3, label: 'Notice them regularly' },
      { value: 4, label: 'Frequently observe patterns of synchronicity' },
      { value: 5, label: 'Live in a state of flow guided by synchronicities' }
    ]
  }
];

// Define consciousness levels based on score ranges
const consciousnessLevels = {
  level1: { min: 5, max: 10, name: 'Awakening Explorer', description: 'Beginning to explore consciousness beyond the material plane' },
  level2: { min: 11, max: 15, name: 'Pattern Observer', description: 'Recognizing meaningful patterns in life experiences' },
  level3: { min: 16, max: 20, name: 'Energy Sensitive', description: 'Developing awareness of subtle energies and frequencies' },
  level4: { min: 21, max: 25, name: 'Quantum Thinker', description: 'Understanding the interconnected nature of reality' }
};

const ConsciousnessAssessment: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [assessmentComplete, setAssessmentComplete] = useState(false);

  const handleAnswer = (value: number) => {
    const questionId = questions[currentQuestion].id;
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate final score
      const totalScore = Object.values(newAnswers).reduce((sum, val) => sum + val, 0);
      setScore(totalScore);
      
      // Determine consciousness level
      let level = '';
      if (totalScore >= consciousnessLevels.level4.min) {
        level = consciousnessLevels.level4.name;
      } else if (totalScore >= consciousnessLevels.level3.min) {
        level = consciousnessLevels.level3.name;
      } else if (totalScore >= consciousnessLevels.level2.min) {
        level = consciousnessLevels.level2.name;
      } else {
        level = consciousnessLevels.level1.name;
      }
      
      setResult(level);
      setAssessmentComplete(true);
      
      // Store assessment result
      localStorage.setItem('initialAssessmentCompleted', 'true');
      localStorage.setItem('consciousnessLevel', level);
      localStorage.setItem('consciousnessScore', totalScore.toString());
    }
  };

  const progress = ((currentQuestion + (assessmentComplete ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {!assessmentComplete ? (
          <Card className="bg-black/30 backdrop-blur-md border-violet-500/20 p-6 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
              <MetatronsCube size={200} color="rgba(255,255,255,0.2)" />
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">
              Consciousness Assessment
            </h2>
            
            <Progress value={progress} className="h-2 mb-8" indicatorClassName="bg-violet-500" />
            
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h3 className="text-xl text-white mb-6">{questions[currentQuestion].question}</h3>
              
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left p-4 border-violet-500/30 hover:bg-violet-500/20 text-white"
                    onClick={() => handleAnswer(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </motion.div>
            
            <div className="text-sm text-white/60 text-center">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-black/30 backdrop-blur-md border-violet-500/20 p-8 relative overflow-hidden text-center">
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
                <MetatronsCube size={400} color="rgba(255,255,255,0.5)" />
              </div>
              
              <h2 className="text-3xl font-semibold text-white mb-4">Assessment Complete</h2>
              
              <div className="mb-8 relative">
                <div className="inline-block relative">
                  <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                  <div className="text-5xl font-bold text-white relative">
                    {score}
                    <span className="text-lg text-white/60 ml-1">/ 25</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-medium text-violet-300 mb-4">
                Your Consciousness Level:
              </h3>
              
              <div className="text-3xl font-bold text-white mb-8">{result}</div>
              
              <p className="text-white/80 mb-8">
                This assessment provides a starting point for your quantum journey. 
                As you progress through practices and reflections, you'll expand
                your consciousness to new dimensions.
              </p>
              
              <Button className="bg-violet-500 hover:bg-violet-600 text-white w-full py-6 text-lg">
                Begin Your Quantum Journey
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConsciousnessAssessment;
