
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import GlassmorphicContainer from '@/components/visual-foundation/GlassmorphicContainer';
import { NavigationNodeData } from './NodeData';

interface InfoPanelProps {
  node: NavigationNodeData;
  onClose: () => void;
  theme: string;
}

// Animation variants for the info panel
const infoPanelVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    x: 50,
    transition: {
      duration: 0.2
    }
  }
};

const InfoPanel: React.FC<InfoPanelProps> = ({ node, onClose, theme }) => {
  // Convert theme string to a valid variant
  const getVariant = (themeStr: string) => {
    if (themeStr === 'default' || themeStr === 'cosmic' || themeStr === 'ethereal' || themeStr === 'quantum') {
      return themeStr;
    }
    return 'default'; // Fallback to default if not valid
  };

  const variantTheme = getVariant(theme);

  return (
    <motion.div
      className="absolute left-full ml-6 w-64"
      variants={infoPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <GlassmorphicContainer
        className="p-4 relative"
        variant={variantTheme}
        intensity="medium"
        withGlow
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2"
          onClick={onClose}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <h3 className="text-xl font-display mb-2">{node.label}</h3>
        <p className="text-sm text-white/80 mb-4">{node.description}</p>
        
        <Button 
          className="w-full"
          onClick={() => window.location.href = node.route || '/'}
        >
          Explore
        </Button>
      </GlassmorphicContainer>
    </motion.div>
  );
};

export default InfoPanel;
