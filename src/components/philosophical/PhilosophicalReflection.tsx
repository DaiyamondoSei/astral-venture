
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, HeartHandshake } from 'lucide-react';

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
  "In what ways are you participating in creating your reality, rather than just experiencing it?"
];

const PhilosophicalReflection: React.FC = () => {
  // Randomly select a quote and prompt each time component renders
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const randomPrompt = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];

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
          Contemplate the nature of consciousness and emotion
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
        
        <div className="flex items-center pt-2 text-xs text-white/50">
          <HeartHandshake size={14} className="mr-1 text-primary/50" />
          <span>Reflect on this during your energy practice to deepen your consciousness</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhilosophicalReflection;
