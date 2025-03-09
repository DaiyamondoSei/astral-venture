
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, ArrowRight } from 'lucide-react';
import MetatronsBackground from '@/components/sacred-geometry/components/MetatronsBackground';

interface DreamCaptureProps {
  onComplete: (dreamText: string) => void;
  onSkip: () => void;
}

const DreamCapture: React.FC<DreamCaptureProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState<'intro' | 'input' | 'affirmation'>('intro');
  const [dream, setDream] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  
  const handleSubmit = async () => {
    if (dream.trim().length < 3) return;
    
    setIsSubmitting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStep('affirmation');
    setIsSubmitting(false);
  };
  
  const handleComplete = () => {
    onComplete(dream);
  };
  
  const handleSkipConfirmed = () => {
    onSkip();
  };
  
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#221F26] via-[#2C2B33] to-[#191A23]" />
      <div className="absolute inset-0 opacity-40">
        <MetatronsBackground intensity="low" animated={true} opacity={0.2} consciousnessLevel={3} />
      </div>
      
      {/* Content */}
      <motion.div 
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg w-full bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10"
      >
        {step === 'intro' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-quantum-500/30 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-quantum-100" />
            </div>
            
            <h1 className="text-3xl font-display text-white">Welcome to Quanex</h1>
            
            <p className="text-white/80 leading-relaxed">
              Your journey begins with a dream - a vision of what you wish to manifest in your life. This dream will serve as the foundation for your quantum journey.
            </p>
            
            <p className="text-white/60 text-sm">
              The vibrations of your intention will ripple through the quantum field, attracting resonant energies and experiences.
            </p>
            
            <Button 
              size="lg" 
              className="bg-quantum-500 hover:bg-quantum-400 text-white w-full"
              onClick={() => setStep('input')}
            >
              Begin My Journey
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            
            <button 
              className="text-white/40 text-sm hover:text-white/60 transition-colors"
              onClick={() => setShowSkipConfirm(true)}
            >
              I'll define my dream later
            </button>
          </div>
        )}
        
        {step === 'input' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display text-white text-center">Define Your Dream</h2>
            
            <p className="text-white/80 leading-relaxed">
              What is your deepest aspiration? The vision that resonates most strongly with your soul's purpose? 
            </p>
            
            <div className="space-y-2">
              <label htmlFor="dream-input" className="text-white/70 text-sm">
                My dream is to:
              </label>
              <Textarea
                id="dream-input"
                placeholder="Describe your dream or aspiration..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px]"
                value={dream}
                onChange={(e) => setDream(e.target.value)}
              />
            </div>
            
            <Button 
              className="bg-quantum-500 hover:bg-quantum-400 text-white w-full"
              onClick={handleSubmit}
              disabled={dream.trim().length < 3 || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <motion.div 
                    className="w-4 h-4 border-2 border-white/30 border-t-white/90 rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Integrating with quantum field...
                </span>
              ) : (
                <span className="flex items-center">
                  <Send className="mr-2 w-4 h-4" />
                  Submit Dream
                </span>
              )}
            </Button>
            
            <button 
              className="text-white/40 text-sm hover:text-white/60 transition-colors w-full text-center"
              onClick={() => setShowSkipConfirm(true)}
            >
              Skip for now
            </button>
          </div>
        )}
        
        {step === 'affirmation' && (
          <div className="space-y-6 text-center">
            <motion.div 
              className="w-20 h-20 mx-auto relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-quantum-500/20 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-gradient-to-br from-quantum-400 to-quantum-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-2xl font-display text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Dream Integrated
            </motion.h2>
            
            <motion.p 
              className="text-white/80 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Your dream has been integrated into the quantum field. As you progress through practices and reflections, you'll align your energies with this intention.
            </motion.p>
            
            <motion.div
              className="bg-white/5 border border-white/10 rounded-lg p-4 text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <p className="text-white/90 italic">"{dream}"</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Button 
                className="bg-quantum-500 hover:bg-quantum-400 text-white w-full"
                onClick={handleComplete}
              >
                Begin My Quantum Journey
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        )}
        
        {/* Skip confirmation dialog */}
        {showSkipConfirm && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="bg-[#2C2B33] rounded-xl p-6 max-w-sm w-full shadow-xl border border-white/10"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h3 className="text-xl text-white mb-4">Continue without a dream?</h3>
              <p className="text-white/70 mb-6">
                Without a dream anchor, your quantum journey will use generalized energy patterns. You can define your dream later as you gain clarity.
              </p>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-white/20 text-white/80 hover:bg-white/10"
                  onClick={() => setShowSkipConfirm(false)}
                >
                  Go Back
                </Button>
                <Button 
                  className="flex-1 bg-quantum-500/80 hover:bg-quantum-500 text-white"
                  onClick={handleSkipConfirmed}
                >
                  Continue Without Dream
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DreamCapture;
