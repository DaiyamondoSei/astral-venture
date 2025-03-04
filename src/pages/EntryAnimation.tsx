
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import OrbToAstralTransition from '@/components/OrbToAstralTransition';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const EntryAnimationPage = () => {
  const navigate = useNavigate();
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [futureMessage, setFutureMessage] = useState('');
  const [personalDream, setPersonalDream] = useState('');
  const [showDreamInput, setShowDreamInput] = useState(false);
  const [dreamSubmitted, setDreamSubmitted] = useState(false);
  
  const handleAnimationComplete = () => {
    setAnimationCompleted(true);
    
    // After the initial animation completes, show the dream input
    setShowDreamInput(true);
  };

  const handleDreamSubmit = () => {
    if (personalDream.trim().length < 10) return;
    
    setDreamSubmitted(true);
    setShowDreamInput(false);
    
    // Generate a personalized message based on their dream
    // This could later be enhanced with AI analysis
    const dreamKeywords = personalDream.toLowerCase();
    let customMessage = '';
    
    if (dreamKeywords.includes('love') || dreamKeywords.includes('connect') || dreamKeywords.includes('relationship')) {
      customMessage = "Your heart's desires are already aligning with your future reality";
    } else if (dreamKeywords.includes('success') || dreamKeywords.includes('wealth') || dreamKeywords.includes('abundance')) {
      customMessage = "The seeds of abundance you plant today are blooming in your future timeline";
    } else if (dreamKeywords.includes('peace') || dreamKeywords.includes('calm') || dreamKeywords.includes('harmony')) {
      customMessage = "The inner peace you seek has already found you in your highest timeline";
    } else if (dreamKeywords.includes('health') || dreamKeywords.includes('healing') || dreamKeywords.includes('energy')) {
      customMessage = "Your future self is channeling healing energy back through your timeline";
    } else {
      // Default messages if no specific keywords match
      const messages = [
        "Your path to inner awakening begins with this intention you've set",
        "The quantum field is already responding to your conscious desire",
        "Your future self is resonating with the aspiration you've shared",
        "This dream you've expressed is creating ripples across your timeline",
        "The energy of your intention now connects you to your evolved self"
      ];
      customMessage = messages[Math.floor(Math.random() * messages.length)];
    }
    
    setFutureMessage(customMessage);
  };

  const handleContinue = () => {
    // Save the dream in localStorage to use later for personalizing the experience
    if (personalDream) {
      localStorage.setItem('userDream', personalDream);
    }
    navigate('/');
  };

  return (
    <Layout className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-lg">
        <OrbToAstralTransition onComplete={handleAnimationComplete} />
        
        {showDreamInput && !dreamSubmitted && (
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-white/90 mb-3 font-display text-xl">
              What is your deepest dream or aspiration?
            </h3>
            <p className="text-white/70 mb-4 text-sm">
              Your answer will help shape your astral body and guide your journey
            </p>
            
            <Textarea
              value={personalDream}
              onChange={(e) => setPersonalDream(e.target.value)}
              placeholder="Share your vision of your ideal future self..."
              className="min-h-[100px] bg-black/20 border-quantum-500/30 placeholder:text-white/40 mb-4"
            />
            
            <Button 
              onClick={handleDreamSubmit}
              disabled={personalDream.trim().length < 10}
              className="bg-gradient-to-r from-quantum-500 to-astral-500 hover:from-quantum-600 hover:to-astral-600"
            >
              <Sparkles size={16} className="mr-2" />
              Connect to Future Self
            </Button>
          </motion.div>
        )}
        
        {dreamSubmitted && (
          <motion.div 
            className="text-center mt-6" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-white/90 mb-4 font-display text-xl">
              Message from your future self:
            </p>
            <p className="text-white/80 mb-6 italic">
              "{futureMessage}"
            </p>
            <Button 
              onClick={handleContinue}
              className="bg-gradient-to-r from-quantum-500 to-astral-500 hover:from-quantum-600 hover:to-astral-600"
            >
              Continue to Your Practice
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default EntryAnimationPage;
