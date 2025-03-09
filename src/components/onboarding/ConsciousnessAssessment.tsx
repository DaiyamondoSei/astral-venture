
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  ChevronDown
} from 'lucide-react';

type Question = {
  id: string;
  text: string;
  options: {
    text: string;
    value: number;
  }[];
};

const questions: Question[] = [
  {
    id: 'awareness',
    text: 'How often do you notice subtle emotional changes in yourself during daily activities?',
    options: [
      { text: 'Rarely or never', value: 1 },
      { text: 'Sometimes, but not consistently', value: 2 },
      { text: 'Often, especially during significant events', value: 3 },
      { text: 'Almost always, I\'m frequently aware of my emotional state', value: 4 },
      { text: 'Continuously, with deep awareness of subtle shifts', value: 5 }
    ]
  },
  {
    id: 'presence',
    text: 'When engaged in routine tasks (like washing dishes), how present are you in the moment?',
    options: [
      { text: 'My mind is usually elsewhere', value: 1 },
      { text: 'I notice when my mind wanders but struggle to stay present', value: 2 },
      { text: 'I can be present for short periods with effort', value: 3 },
      { text: 'I'm often present but occasionally drift', value: 4 },
      { text: 'I can maintain consistent presence and awareness', value: 5 }
    ]
  },
  {
    id: 'connection',
    text: 'How would you describe your sense of connection to something greater than yourself?',
    options: [
      { text: 'I don\'t feel any particular connection', value: 1 },
      { text: 'I occasionally sense a connection, especially in nature', value: 2 },
      { text: 'I often feel connected to something larger', value: 3 },
      { text: 'I regularly experience a sense of unity with life', value: 4 },
      { text: 'I consistently experience deep interconnectedness', value: 5 }
    ]
  },
  {
    id: 'purpose',
    text: 'How clear is your sense of purpose or meaning in life?',
    options: [
      { text: 'Unclear, I'm still searching', value: 1 },
      { text: 'I have glimpses but no consistent sense of purpose', value: 2 },
      { text: 'I have some direction but it's still developing', value: 3 },
      { text: 'I have a strong sense of purpose in most areas', value: 4 },
      { text: 'My purpose feels clear, aligned and integrated in my life', value: 5 }
    ]
  },
  {
    id: 'meditation',
    text: 'What is your experience with meditation or mindfulness practices?',
    options: [
      { text: 'No experience or very limited', value: 1 },
      { text: 'I\'ve tried occasionally but don\'t practice regularly', value: 2 },
      { text: 'I practice irregularly, a few times per month', value: 3 },
      { text: 'I have a consistent weekly practice', value: 4 },
      { text: 'Daily practice is integrated into my life', value: 5 }
    ]
  }
];

interface ConsciousnessAssessmentProps {
  onComplete: (results: Record<string, number>) => void;
  onBack: () => void;
}

const ConsciousnessAssessment: React.FC<ConsciousnessAssessmentProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [expandedExplanation, setExpandedExplanation] = useState<number | null>(null);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setExpandedExplanation(null);
    } else {
      onComplete(answers);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setExpandedExplanation(null);
    } else {
      onBack();
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isQuestionAnswered = currentQuestionData && answers[currentQuestionData.id];

  const toggleExplanation = (index: number) => {
    setExpandedExplanation(expandedExplanation === index ? null : index);
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-2xl mx-auto px-4 py-6">
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center text-white mb-2">Consciousness Assessment</h2>
        <p className="text-center text-white/80 mb-6">
          This assessment helps us understand your current consciousness level and personalize your journey.
        </p>
        
        <div className="w-full mb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-right mt-1 text-white/70">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        
        <Card className="bg-black/40 backdrop-blur-lg border-purple-800/30 p-6 w-full">
          <h3 className="text-xl font-semibold text-white mb-4">
            {currentQuestionData.text}
          </h3>
          
          <div className="space-y-3 mt-6">
            {currentQuestionData.options.map((option, index) => (
              <div key={index} className="space-y-2">
                <div 
                  className={`p-3 rounded-lg cursor-pointer transition-all flex justify-between items-center
                    ${answers[currentQuestionData.id] === option.value 
                      ? 'bg-purple-800/50 border border-purple-500' 
                      : 'bg-gray-800/40 border border-gray-700/50 hover:bg-gray-700/50'}`}
                  onClick={() => handleAnswer(currentQuestionData.id, option.value)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center
                      ${answers[currentQuestionData.id] === option.value 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-700'}`}
                    >
                      {answers[currentQuestionData.id] === option.value && (
                        <CheckCircle size={14} />
                      )}
                    </div>
                    <span className="text-white">{option.text}</span>
                  </div>
                  
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform ${expandedExplanation === index ? 'transform rotate-180' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExplanation(index);
                    }}
                  />
                </div>
                
                {expandedExplanation === index && (
                  <div className="text-sm text-white/70 pl-8 pr-4 py-2 bg-gray-800/30 rounded-lg">
                    <p>This response indicates a {index === 0 ? 'beginning' : index === 4 ? 'highly developed' : 'developing'} level of consciousness in this area.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
        
        <div className="flex justify-between mt-6">
          <Button 
            onClick={goToPreviousQuestion}
            variant="outline"
            className="flex items-center gap-1 border-white/20 text-white hover:bg-white/10"
          >
            <ChevronLeft size={16} /> Back
          </Button>
          
          <Button 
            onClick={goToNextQuestion}
            disabled={!isQuestionAnswered}
            className={`flex items-center gap-1 ${isQuestionAnswered ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600/50 cursor-not-allowed'}`}
          >
            {currentQuestion < questions.length - 1 ? 'Next' : 'Complete'} <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsciousnessAssessment;
