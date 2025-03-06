
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Triangle, 
  CircleDot, 
  Sun, 
  Zap, 
  Brain, 
  Eye, 
  Sparkles,
  BookOpen,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepContentProps {
  step: string;
  onInteraction?: (interactionType: string, stepId: string) => void;
}

// Animation variants for content transitions
const variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
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

const StepContent: React.FC<StepContentProps> = ({ step, onInteraction }) => {
  const [interacted, setInteracted] = useState(false);
  const [selectedChakra, setSelectedChakra] = useState<number | null>(null);
  const [rotationDegree, setRotationDegree] = useState(0);
  
  const handleInteraction = (type: string) => {
    setInteracted(true);
    if (onInteraction) onInteraction(type, step);
  };
  
  const handleChakraClick = (index: number) => {
    setSelectedChakra(index);
    handleInteraction('chakra_selected');
  };
  
  const handleRotateGeometry = () => {
    setRotationDegree(prev => prev + 45);
    handleInteraction('geometry_rotated');
  };

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
          
          <motion.button
            className={`mt-4 px-6 py-2.5 rounded-md bg-gradient-to-r from-quantum-500 to-astral-500 text-white font-medium shadow-md ${interacted ? 'opacity-80' : 'animate-pulse'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleInteraction('welcome_begin')}
          >
            {interacted ? 'Journey Initiated' : 'Begin Your Journey'}
            {interacted && <CheckCircle className="inline-block ml-2 h-4 w-4" />}
          </motion.button>
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
            <motion.div 
              animate={{ rotate: rotationDegree }}
              transition={{ type: "spring", damping: 10 }}
            >
              <svg viewBox="0 0 100 100" className="w-32 h-32 stroke-quantum-400">
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" strokeWidth="0.5" />
                <polygon points="50,10 90,50 50,90 10,50" fill="none" strokeWidth="0.5" />
                <polygon points="30,20 70,20 70,80 30,80" fill="none" strokeWidth="0.5" />
              </svg>
            </motion.div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute bottom-2 right-2 bg-black/30 text-white border-white/20"
              onClick={handleRotateGeometry}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Rotate
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            In Quanex, you'll interact with Metatron's Cube to access different aspects of your spiritual practice.
          </p>
          
          {rotationDegree >= 180 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-sm text-emerald-400"
            >
              <CheckCircle className="inline-block mr-2 h-4 w-4" /> 
              You've discovered the multidimensional nature of sacred geometry!
            </motion.div>
          )}
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
              <motion.div 
                key={i} 
                className="flex flex-col items-center gap-1 cursor-pointer"
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChakraClick(i)}
              >
                <div 
                  className={`w-8 h-8 rounded-full ${selectedChakra === i ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''}`} 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-xs text-muted-foreground">{chakraNames[i]}</span>
              </motion.div>
            ))}
          </div>
          
          {selectedChakra !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/20"
            >
              <h4 className="font-medium text-white">{chakraNames[selectedChakra]} Chakra</h4>
              <p className="text-sm text-white/80 mt-1">
                {selectedChakra === 0 && "Associated with survival, grounding, and stability. When balanced, you feel secure and confident."}
                {selectedChakra === 1 && "Connected to creativity, pleasure, and emotional well-being. When balanced, you feel passionate and expressive."}
                {selectedChakra === 2 && "Governs personal power, confidence, and self-esteem. When balanced, you feel empowered and decisive."}
                {selectedChakra === 3 && "The center of love, compassion, and connection. When balanced, you can give and receive love freely."}
                {selectedChakra === 4 && "Related to communication, self-expression, and truth. When balanced, you communicate honestly and listen effectively."}
                {selectedChakra === 5 && "Linked to intuition, imagination, and inner wisdom. When balanced, you trust your intuition and see clearly."}
                {selectedChakra === 6 && "Connected to spiritual awareness and enlightenment. When balanced, you feel a sense of unity and purpose."}
              </p>
            </motion.div>
          )}
          
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
            <motion.div 
              className="h-2 bg-background/30 rounded-full overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleInteraction('energy_bar_clicked')}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: interacted ? '45%' : '30%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
              ></motion.div>
            </motion.div>
            
            <div className="mt-2 text-xs text-center text-muted-foreground">
              {interacted ? '45 / 100 Energy Points' : '30 / 100 Energy Points'}
              {interacted && (
                <span className="ml-2 text-cyan-400">+15 <Sparkles className="inline h-3 w-3" /></span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Complete reflections, meditations, and daily challenges to increase your energy points and ascend to higher levels.
          </p>
          
          {interacted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-400"
            >
              <CheckCircle className="inline-block mr-2 h-4 w-4" /> 
              You've earned bonus energy for exploring this feature!
            </motion.div>
          )}
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
            <motion.div 
              className="relative cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleInteraction('meditation_pulse_clicked')}
            >
              <CircleDot className={`h-16 w-16 text-purple-500 ${interacted ? 'animate-pulse' : ''}`} />
              {interacted && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-purple-500/20"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
              )}
            </motion.div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Access guided meditations, breathing exercises, and visualization techniques through the Meditation node in Metatron's Cube.
          </p>
          
          {interacted && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2 p-3 bg-purple-900/20 rounded-md"
            >
              <h4 className="text-sm font-medium text-purple-300">Try this simple breath exercise:</h4>
              <ol className="mt-2 text-sm space-y-2 text-white/80">
                <li>1. Breathe in deeply through your nose for 4 counts</li>
                <li>2. Hold your breath for 4 counts</li>
                <li>3. Exhale slowly through your mouth for 6 counts</li>
                <li>4. Repeat 3 times</li>
              </ol>
            </motion.div>
          )}
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
            <motion.div 
              className="h-16 bg-emerald-950/20 rounded mt-2 border border-emerald-500/10 p-2 text-sm text-white/60 cursor-text"
              whileHover={{ borderColor: 'rgba(52, 211, 153, 0.3)' }}
              onClick={() => handleInteraction('reflection_input_clicked')}
            >
              {interacted ? "I've noticed that I feel more centered when I take time to breathe consciously..." : "Click to add your reflection..."}
            </motion.div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Regular reflection helps activate chakras and generates personalized insights about your spiritual growth.
          </p>
          
          {interacted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-sm text-emerald-400"
            >
              <CheckCircle className="inline-block mr-2 h-4 w-4" /> 
              Your reflection has activated your Heart and Throat chakras!
            </motion.div>
          )}
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
              <motion.div 
                key={i} 
                className="p-3 bg-quantum-500/10 rounded-lg text-sm cursor-pointer"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + (i * 0.2) }}
                whileHover={{ 
                  backgroundColor: 'rgba(136, 85, 255, 0.2)',
                  y: -2
                }}
                onClick={() => handleInteraction(`complete_activity_${activity.toLowerCase()}`)}
              >
                {activity}
              </motion.div>
            ))}
          </div>
          
          <motion.p 
            className="text-sm text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            You can revisit this guide anytime through the settings menu.
          </motion.p>
          
          <motion.button
            className="mt-6 px-6 py-3 rounded-md bg-gradient-to-r from-quantum-500 to-astral-500 text-white font-medium shadow-md"
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(136, 85, 255, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleInteraction('journey_begin')}
          >
            Begin Your Cosmic Journey
          </motion.button>
        </motion.div>
      );

    default:
      return <div>Unknown step</div>;
  }
};

export default StepContent;
