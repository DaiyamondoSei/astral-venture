
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import StarsBackground from '@/components/entry-animation/StarsBackground';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DreamCapture = () => {
  const [dream, setDream] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [fadeInMessage, setFadeInMessage] = useState(false);
  const [personalizedMessage, setPersonalizedMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const analyzeDream = (dreamText: string) => {
    // Basic emotional content analysis
    const dreamLower = dreamText.toLowerCase();
    
    // Check for emotional themes
    let dominantTheme = '';
    const themes = [
      { name: 'love', keywords: ['love', 'heart', 'connection', 'relationship', 'together', 'compassion'] },
      { name: 'peace', keywords: ['peace', 'calm', 'tranquil', 'harmony', 'balance', 'serenity', 'quiet'] },
      { name: 'power', keywords: ['power', 'strength', 'success', 'achieve', 'win', 'overcome', 'confident'] },
      { name: 'wisdom', keywords: ['wisdom', 'knowledge', 'understand', 'learn', 'mind', 'awareness', 'insight'] },
      { name: 'creativity', keywords: ['creativity', 'create', 'imagine', 'art', 'express', 'inspire', 'innovative'] },
      { name: 'spirituality', keywords: ['spirit', 'divine', 'soul', 'universe', 'cosmic', 'energy', 'consciousness'] },
      { name: 'healing', keywords: ['heal', 'recovery', 'health', 'better', 'transform', 'renew', 'regenerate'] }
    ];
    
    // Find the theme with the most matches
    let highestCount = 0;
    themes.forEach(theme => {
      let count = 0;
      theme.keywords.forEach(keyword => {
        if (dreamLower.includes(keyword)) count++;
      });
      
      if (count > highestCount) {
        highestCount = count;
        dominantTheme = theme.name;
      }
    });
    
    // Generate personalized message based on dominant theme
    let message = '';
    switch(dominantTheme) {
      case 'love':
        message = "Your heart chakra is resonating strongly with your dreams of deeper connection. Your future self is already experiencing the love you seek.";
        break;
      case 'peace':
        message = "The tranquility you seek is already flowing through your timeline, connecting your present moment to your peaceful future self.";
        break;
      case 'power':
        message = "Your solar plexus chakra is activating as you align with your most empowered future self. The strength you seek is awakening within you.";
        break;
      case 'wisdom':
        message = "Your third eye chakra is opening to greater awareness. The wisdom you seek is already flowing to you from your evolved future self.";
        break;
      case 'creativity':
        message = "Your sacral chakra is vibrating with creative potential. The artistic expression you desire is already manifesting across your timeline.";
        break;
      case 'spirituality':
        message = "Your crown chakra is illuminating as you connect to higher consciousness. Your spiritual evolution is accelerating through this connection.";
        break;
      case 'healing':
        message = "A wave of healing energy is flowing through your timeline from your future self, already beginning the transformation you seek.";
        break;
      default:
        message = "Your authentic desires are creating ripples across your timeline, connecting you with the highest version of your future self.";
    }
    
    return { message, dominantTheme };
  };

  const handleSubmit = () => {
    if (dream.trim().length < 15) {
      toast({
        title: "Dream too short",
        description: "Please share a more detailed dream or aspiration (at least 15 characters)",
        variant: "destructive"
      });
      return;
    }
    
    // Save dream to localStorage to use throughout the app
    localStorage.setItem('userDream', dream);
    localStorage.setItem('dreamCaptureCompleted', 'true');
    
    // Analyze emotional content
    const { message, dominantTheme } = analyzeDream(dream);
    localStorage.setItem('dominantDreamTheme', dominantTheme);
    
    // Set personalized message
    setPersonalizedMessage(message);
    
    // Transition states
    setSubmitted(true);
    setTimeout(() => setFadeInMessage(true), 500);
  };

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <Layout className="flex items-center justify-center min-h-screen overflow-hidden">
      <StarsBackground />
      
      <div className="relative z-10 max-w-xl w-full px-4">
        {!submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="glass-card p-6 text-center"
          >
            <h2 className="text-2xl font-display text-white mb-3">
              Connect With Your Future Self
            </h2>
            <p className="text-white/80 mb-6">
              Share your deepest dream or aspiration. This will help calibrate your astral field and connect you with your highest timeline.
            </p>
            
            <Textarea
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              placeholder="I dream of..."
              className="min-h-[120px] bg-black/30 border-quantum-500/30 placeholder:text-white/40 mb-6"
            />
            
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-quantum-500 to-astral-500 hover:from-quantum-600 hover:to-astral-600"
              disabled={dream.trim().length < 15}
            >
              <Sparkles size={16} className="mr-2" />
              Send to Future Self
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: fadeInMessage ? 1 : 0, scale: fadeInMessage ? 1 : 0.9 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h3 className="text-xl font-display text-white mb-5">
                Message Received Across Time
              </h3>
              
              <p className="text-white/90 italic mb-6 text-lg">
                "{personalizedMessage}"
              </p>
              
              <p className="text-white/70 mb-6 text-sm">
                Your dream has been encoded into your astral field. This information will guide your journey and help activate the appropriate energy centers.
              </p>
              
              <Button 
                onClick={handleContinue}
                className="bg-gradient-to-r from-quantum-500 to-astral-500 hover:from-quantum-600 hover:to-astral-600"
              >
                Begin Your Journey
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default DreamCapture;
