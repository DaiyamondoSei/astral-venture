
import React from 'react';
import { motion } from 'framer-motion';
import { Triangle, CircleDot, Sun, Zap, Brain, Eye, Sparkles } from 'lucide-react';

interface OnboardingContentProps {
  step: string;
}

const OnboardingContent: React.FC<OnboardingContentProps> = ({ step }) => {
  // Animation variants for content transitions
  const variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const renderContent = () => {
    switch (step) {
      case 'welcome':
        return (
          <motion.div 
            variants={variants}
            initial="hidden"
            animate="visible"
            className="space-y-4 text-center"
          >
            <Sparkles className="mx-auto h-12 w-12 text-quantum-500" />
            <h2 className="text-2xl font-bold font-display tracking-tight text-primary">Welcome to Quanex</h2>
            <p className="text-muted-foreground">
              Your journey to higher consciousness begins here. Let's explore the sacred tools and wisdom that will guide your spiritual growth.
            </p>
            <div className="p-4 bg-quantum-500/10 rounded-lg mt-6">
              <p className="text-sm">This guided tour will introduce you to sacred geometry, chakras, and how to use the application to deepen your practice.</p>
            </div>
          </motion.div>
        );

      case 'sacred-geometry':
        return (
          <motion.div 
            variants={variants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Triangle className="h-8 w-8 text-emerald-500" />
              <h2 className="text-xl font-bold font-display tracking-tight text-primary">Sacred Geometry</h2>
            </div>
            <p className="text-muted-foreground">
              Sacred geometry reveals the mathematical patterns that form the foundation of our universe. Metatron's Cube is a powerful symbol containing all Platonic solids.
            </p>
            <div className="relative h-48 w-full bg-gradient-to-br from-black/50 to-quantum-950/50 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-quantum-500 to-transparent"></div>
              <svg viewBox="0 0 100 100" className="w-32 h-32 stroke-quantum-400">
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" strokeWidth="0.5" />
                <polygon points="50,10 90,50 50,90 10,50" fill="none" strokeWidth="0.5" />
                <polygon points="30,20 70,20 70,80 30,80" fill="none" strokeWidth="0.5" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              In Quanex, you'll interact with Metatron's Cube to access different aspects of your spiritual practice.
            </p>
          </motion.div>
        );

      case 'chakras':
        return (
          <motion.div 
            variants={variants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Sun className="h-8 w-8 text-orange-500" />
              <h2 className="text-xl font-bold font-display tracking-tight text-primary">Chakra System</h2>
            </div>
            <p className="text-muted-foreground">
              Chakras are energy centers in your astral body. There are seven main chakras, each associated with different aspects of consciousness.
            </p>
            <div className="grid grid-cols-7 gap-1 mt-4 justify-items-center">
              {['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'].map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: color }}></div>
                  <span className="text-xs text-muted-foreground">{chakraNames[i]}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              As you grow in your practice, you'll activate and balance these energy centers.
            </p>
          </motion.div>
        );

      case 'energy-points':
        return (
          <motion.div 
            variants={variants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-cyan-500" />
              <h2 className="text-xl font-bold font-display tracking-tight text-primary">Energy Points</h2>
            </div>
            <p className="text-muted-foreground">
              Your spiritual journey is measured through energy points, which reflect your growth and commitment to practice.
            </p>
            <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Current Level: 1</span>
                <span className="text-sm">Next Level: 2</span>
              </div>
              <div className="h-2 bg-background/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <div className="mt-2 text-xs text-center text-muted-foreground">30 / 100 Energy Points</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete reflections, meditations, and daily challenges to increase your energy points and ascend to higher levels.
            </p>
          </motion.div>
        );

      case 'meditation':
        return (
          <motion.div 
            variants={variants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-500" />
              <h2 className="text-xl font-bold font-display tracking-tight text-primary">Meditation Practice</h2>
            </div>
            <p className="text-muted-foreground">
              Meditation is a key practice for expanding consciousness and connecting with your higher self.
            </p>
            <div className="flex justify-center my-4">
              <div className="relative">
                <CircleDot className="h-16 w-16 text-purple-500 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping"></div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Access guided meditations, breathing exercises, and visualization techniques through the Meditation node in Metatron's Cube.
            </p>
          </motion.div>
        );

      case 'reflection':
        return (
          <motion.div 
            variants={variants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-emerald-500" />
              <h2 className="text-xl font-bold font-display tracking-tight text-primary">Reflection Practice</h2>
            </div>
            <p className="text-muted-foreground">
              Self-reflection deepens your understanding of your inner world and spiritual journey.
            </p>
            <div className="p-4 border border-emerald-500/20 rounded-lg">
              <p className="text-sm italic">
                "What patterns or insights have emerged in your consciousness today?"
              </p>
              <div className="h-16 bg-emerald-950/20 rounded mt-2 border border-emerald-500/10"></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Regular reflection helps activate chakras and generates personalized insights about your spiritual growth.
            </p>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div 
            variants={variants}
            initial="hidden"
            animate="visible"
            className="space-y-4 text-center"
          >
            <Sparkles className="mx-auto h-12 w-12 text-quantum-500" />
            <h2 className="text-2xl font-bold font-display tracking-tight text-primary">Your Journey Begins</h2>
            <p className="text-muted-foreground">
              You're now ready to explore Quanex and deepen your spiritual practice. Remember, this is just the beginning.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {['Meditate', 'Reflect', 'Learn'].map((activity, i) => (
                <div key={i} className="p-3 bg-quantum-500/10 rounded-lg text-sm">
                  {activity}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              You can revisit this guide anytime through the settings menu.
            </p>
          </motion.div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-[300px]">
      {renderContent()}
    </div>
  );
};

// Chakra names for reference
const chakraNames = [
  'Root',
  'Sacral', 
  'Solar',
  'Heart',
  'Throat',
  'Third Eye',
  'Crown'
];

export default OnboardingContent;
