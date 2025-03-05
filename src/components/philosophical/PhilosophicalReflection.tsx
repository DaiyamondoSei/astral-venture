
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, HeartHandshake, Lightbulb, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { calculateConsciousnessPoints } from './consciousnessAnalyzer';

interface Quote {
  text: string;
  author: string;
  theme: string;
}

const quotes: Quote[] = [
  {
    text: "Consciousness is only possible through change; change is only possible through movement.",
    author: "Aldous Huxley",
    theme: "consciousness"
  },
  {
    text: "The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself.",
    author: "Carl Sagan",
    theme: "interconnection"
  },
  {
    text: "We are not human beings having a spiritual experience. We are spiritual beings having a human experience.",
    author: "Pierre Teilhard de Chardin",
    theme: "identity"
  },
  {
    text: "Emotions are the language of the soul made visible.",
    author: "Kahlil Gibran",
    theme: "emotions"
  },
  {
    text: "Perhaps all the dragons in our lives are princesses who are only waiting to see us act, just once, with beauty and courage.",
    author: "Rainer Maria Rilke",
    theme: "transformation"
  },
  {
    text: "The day science begins to study non-physical phenomena, it will make more progress in one decade than in all the previous centuries of its existence.",
    author: "Nikola Tesla",
    theme: "consciousness"
  },
  {
    text: "In a quantum universe, magic is not the exception but the rule.",
    author: "Deepak Chopra",
    theme: "quantum"
  },
  {
    text: "We are not just observers of the world. We are participants in it.",
    author: "John Wheeler",
    theme: "participation"
  },
  // New expanded quotes on consciousness
  {
    text: "Matter is derived from consciousness, not consciousness from matter.",
    author: "Amit Goswami",
    theme: "quantum consciousness"
  },
  {
    text: "If quantum mechanics hasn't profoundly shocked you, you haven't understood it yet.",
    author: "Niels Bohr",
    theme: "quantum reality"
  },
  {
    text: "The observer is the observed.",
    author: "Jiddu Krishnamurti",
    theme: "perception"
  },
  {
    text: "Your perception creates your reality. Your reality reflects your perception.",
    author: "Alan Watts",
    theme: "reality creation"
  },
  {
    text: "Consciousness is the fundamental thing in existence — it is the energy, the motion, the movement of consciousness that creates the universe and all that is in it.",
    author: "Sri Aurobindo",
    theme: "universal consciousness"
  },
  {
    text: "All matter originates and exists only by virtue of a force... We must assume behind this force the existence of a conscious and intelligent Mind. This Mind is the matrix of all matter.",
    author: "Max Planck",
    theme: "consciousness as foundation"
  },
  {
    text: "You are not a drop in the ocean. You are the entire ocean in a drop.",
    author: "Rumi",
    theme: "oneness"
  }
];

const reflectionPrompts = [
  "How does pattern recognition shape your perception of reality?",
  "In what ways might your consciousness extend beyond your physical form?",
  "How do your emotions serve as messengers from deeper aspects of your being?",
  "Consider the boundary between 'self' and 'other' - how permeable is it really?",
  "How might viewing yourself as a node in a cosmic network change your daily experience?",
  "What if your current challenges are opportunities for consciousness expansion?",
  "How does the observer effect play out in your personal relationships?",
  "In what ways are you participating in creating your reality, rather than just experiencing it?",
  // New expanded prompts
  "Describe a moment when you felt a sense of 'oneness' with everything around you. What insights did this experience reveal?",
  "How might your thoughts be directly influencing the quantum field around you at this very moment?",
  "If consciousness exists beyond the physical brain, how would this change your understanding of death?",
  "Consider the concept that time is not linear but simultaneous. How would this perspective alter your approach to past regrets or future anxieties?",
  "Reflect on the possibility that every person you encounter is another version of universal consciousness experiencing itself. How does this change your interactions?",
  "What evidence have you observed in your own life that suggests consciousness affects physical reality?",
  "How might dreams and meditation be doorways to accessing non-local consciousness?",
  "If you could perceive reality from outside the constraints of your five senses, what additional dimensions might you discover?",
  "Consider the idea that your identity is not fixed but a flowing process of becoming. How does this shift your self-concept?",
  "Reflect on how synchronized events (synchronicities) in your life might be manifestations of consciousness rather than coincidences."
];

const PhilosophicalReflection: React.FC = () => {
  // State for the reflection input
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Randomly select a quote and prompt each time component renders
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const randomPrompt = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];

  const handleSubmitReflection = () => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "You need to be signed in to submit reflections",
        variant: "destructive"
      });
      return;
    }
    
    if (reflection.trim().length < 20) {
      toast({
        title: "Reflection too short",
        description: "Please share more about your thoughts on consciousness (at least 20 characters)",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Analyze the reflection content for consciousness insights
      const { points, insights } = calculateConsciousnessPoints(reflection);
      
      // Store the reflection and points in localStorage for now
      // This could be expanded to use Supabase in a future implementation
      try {
        const existingReflections = JSON.parse(localStorage.getItem('philosophicalReflections') || '[]');
        existingReflections.unshift({
          id: Date.now(),
          content: reflection,
          prompt: randomPrompt,
          points: points,
          timestamp: new Date().toISOString(),
          insights: insights
        });
        localStorage.setItem('philosophicalReflections', JSON.stringify(existingReflections));
      } catch (error) {
        console.error('Error storing philosophical reflection:', error);
      }
      
      setEarnedPoints(points);
      setHasSubmitted(true);
      
      toast({
        title: "Consciousness Reflection Submitted",
        description: `Thank you for your reflection! You earned ${points} consciousness points.`,
      });
    } catch (error: any) {
      console.error('Error submitting reflection:', error);
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewReflection = () => {
    setReflection('');
    setHasSubmitted(false);
    setEarnedPoints(0);
    
    // Refresh the page to get a new quote and prompt
    window.location.reload();
  };

  return (
    <Card className="glass-card border-quantum-500/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="font-display text-lg flex items-center">
            <Sparkles size={18} className="mr-2 text-primary" />
            Philosophical Reflection
          </CardTitle>
          <Badge variant="outline" className="bg-quantum-500/10 text-white/70">
            {randomQuote.theme}
          </Badge>
        </div>
        <CardDescription className="text-white/60">
          Contemplate the nature of consciousness and energy
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="py-3 px-4 bg-black/30 rounded-lg">
          <p className="italic text-white/80 mb-2">"{randomQuote.text}"</p>
          <p className="text-right text-sm text-white/60">— {randomQuote.author}</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
            <Brain size={20} className="text-quantum-400" />
          </div>
          <div>
            <h4 className="text-white/90 font-medium mb-1">Today's Contemplation</h4>
            <p className="text-white/70 text-sm">{randomPrompt}</p>
          </div>
        </div>
        
        {!hasSubmitted ? (
          <>
            <div className="mt-4">
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Share your thoughts, insights, and realizations about consciousness..."
                className="min-h-[120px] bg-black/30 border-quantum-500/30 placeholder:text-white/40"
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-xs text-white/60">
                <Lightbulb size={14} className="mr-1 text-primary/70" />
                <span>Deeper reflections yield more consciousness points</span>
              </div>
              
              <Button 
                onClick={handleSubmitReflection} 
                disabled={isSubmitting || reflection.trim().length < 20}
                className="bg-gradient-to-r from-quantum-400 to-quantum-600 hover:opacity-90"
              >
                <Send size={16} className="mr-2" />
                Submit Reflection
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="bg-quantum-500/10 border border-quantum-500/20 rounded-lg p-4">
              <h4 className="text-white/90 font-medium mb-2 flex items-center">
                <Sparkles size={16} className="mr-2 text-primary" />
                Consciousness Exploration Results
              </h4>
              <p className="text-white/80 mb-3">
                Your reflection demonstrates an expanded awareness and deeper connection to universal consciousness.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Points Earned:</span>
                <span className="text-quantum-400 font-bold">{earnedPoints}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleNewReflection} 
              variant="outline"
              className="w-full border-quantum-500/30 text-white/80 hover:bg-quantum-500/10"
            >
              Explore New Contemplation
            </Button>
          </div>
        )}
        
        <div className="flex items-center pt-2 text-xs text-white/50">
          <HeartHandshake size={14} className="mr-1 text-primary/50" />
          <span>Reflect regularly to expand your consciousness</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhilosophicalReflection;
