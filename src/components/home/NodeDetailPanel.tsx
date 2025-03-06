
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NodeDetailPanelProps {
  nodeId: string;
  energyPoints: number;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ nodeId, energyPoints }) => {
  const navigate = useNavigate();
  
  // Define node details
  const nodeDetails = {
    'meditation': {
      title: 'Meditation Practices',
      description: 'Center your consciousness and access higher states of being through guided and self-directed meditation practices.',
      actions: [
        { label: 'Mindfulness Meditation', path: '/meditation/mindfulness', threshold: 0 },
        { label: 'Energy Centering', path: '/meditation/energy', threshold: 50 },
        { label: 'Transcendence Practice', path: '/meditation/transcendence', threshold: 200 }
      ]
    },
    'chakras': {
      title: 'Chakra Balancing',
      description: 'Activate, balance and harmonize your seven primary energy centers for optimal energy flow throughout your being.',
      actions: [
        { label: 'Daily Activation', path: '/chakras/daily', threshold: 0 },
        { label: 'Chakra Analysis', path: '/chakras/analysis', threshold: 100 },
        { label: 'Advanced Harmonization', path: '/chakras/advanced', threshold: 300 }
      ]
    },
    'dreams': {
      title: 'Dream Exploration',
      description: 'Record, analyze and work with your dreams to unlock insights from your subconscious mind.',
      actions: [
        { label: 'Dream Capture', path: '/dream-capture', threshold: 0 },
        { label: 'Dream Analysis', path: '/dreams/analysis', threshold: 150 },
        { label: 'Lucid Dreaming', path: '/dreams/lucid', threshold: 400 }
      ]
    },
    'energy': {
      title: 'Energy Work',
      description: 'Learn to sense, direct and work with subtle energy fields within and around you.',
      actions: [
        { label: 'Energy Perception', path: '/energy/perception', threshold: 0 },
        { label: 'Energy Channeling', path: '/energy/channeling', threshold: 120 },
        { label: 'Advanced Energy Work', path: '/energy/advanced', threshold: 350 }
      ]
    },
    'reflection': {
      title: 'Conscious Reflection',
      description: 'Deepen self-awareness through guided reflection practices that illuminate your inner landscape.',
      actions: [
        { label: 'Daily Reflection', path: '/reflection/daily', threshold: 0 },
        { label: 'Past Pattern Analysis', path: '/reflection/patterns', threshold: 80 },
        { label: 'Shadow Integration', path: '/reflection/shadow', threshold: 250 }
      ]
    },
    'healing': {
      title: 'Energy Healing',
      description: 'Learn techniques to promote healing and balance for yourself and others through energy work.',
      actions: [
        { label: 'Self-Healing', path: '/healing/self', threshold: 50 },
        { label: 'Distance Healing', path: '/healing/distance', threshold: 200 },
        { label: 'Advanced Healing', path: '/healing/advanced', threshold: 500 }
      ]
    },
    'wisdom': {
      title: 'Cosmic Wisdom',
      description: 'Access universal knowledge and higher guidance through connection with your higher self.',
      actions: [
        { label: 'Wisdom Teachings', path: '/wisdom/teachings', threshold: 100 },
        { label: 'Channeled Messages', path: '/wisdom/channeled', threshold: 300 },
        { label: 'Akashic Records', path: '/wisdom/akashic', threshold: 700 }
      ]
    },
    'astral': {
      title: 'Astral Projection',
      description: 'Learn techniques to consciously project your awareness beyond the physical body.',
      actions: [
        { label: 'Astral Basics', path: '/astral/basics', threshold: 150 },
        { label: 'Guided Projection', path: '/astral/guided', threshold: 400 },
        { label: 'Advanced Projection', path: '/astral/advanced', threshold: 800 }
      ]
    },
    'sacred': {
      title: 'Sacred Geometry',
      description: 'Explore the mathematical patterns that form the foundation of physical and spiritual reality.',
      actions: [
        { label: 'Introduction', path: '/sacred/intro', threshold: 50 },
        { label: 'Meditation with Forms', path: '/sacred/meditation', threshold: 200 },
        { label: 'Advanced Applications', path: '/sacred/advanced', threshold: 600 }
      ]
    },
    'elements': {
      title: 'Elemental Work',
      description: 'Connect with and harness the energies of earth, air, fire, water and ether.',
      actions: [
        { label: 'Element Basics', path: '/elements/basics', threshold: 100 },
        { label: 'Elemental Attunement', path: '/elements/attunement', threshold: 300 },
        { label: 'Advanced Elements', path: '/elements/advanced', threshold: 600 }
      ]
    },
    'consciousness': {
      title: 'Consciousness Expansion',
      description: 'Expand your awareness beyond ordinary limitations through advanced practices.',
      actions: [
        { label: 'Awareness Basics', path: '/consciousness/basics', threshold: 100 },
        { label: 'Beyond Duality', path: '/consciousness/duality', threshold: 400 },
        { label: 'Universal Consciousness', path: '/consciousness/universal', threshold: 1000 }
      ]
    },
    'nature': {
      title: 'Nature Connection',
      description: 'Deepen your relationship with the natural world and its healing powers.',
      actions: [
        { label: 'Natural Awareness', path: '/nature/awareness', threshold: 50 },
        { label: 'Plant Communication', path: '/nature/plants', threshold: 250 },
        { label: 'Advanced Communion', path: '/nature/communion', threshold: 500 }
      ]
    },
    'guidance': {
      title: 'Higher Guidance',
      description: 'Connect with your inner wisdom, spirit guides and higher dimensional beings.',
      actions: [
        { label: 'Inner Guidance', path: '/guidance/inner', threshold: 100 },
        { label: 'Guide Connection', path: '/guidance/connection', threshold: 350 },
        { label: 'Advanced Channeling', path: '/guidance/advanced', threshold: 700 }
      ]
    },
    'cosmic-center': {
      title: 'Cosmic Core',
      description: 'The central point where all energies converge. Your journey\'s heart and source of power.',
      actions: [
        { label: 'Energy Overview', path: '/dashboard', threshold: 0 },
        { label: 'Activation History', path: '/profile/history', threshold: 0 },
        { label: 'Advanced Visualization', path: '/astral-body-demo', threshold: 0 }
      ]
    }
  };
  
  // Get the details for the selected node
  const details = nodeDetails[nodeId as keyof typeof nodeDetails] || {
    title: 'Unknown Node',
    description: 'Information not available.',
    actions: []
  };

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <motion.div 
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-display mb-2">{details.title}</h2>
      <p className="text-white/80 mb-6">{details.description}</p>
      
      <div className="space-y-3">
        {details.actions.map((action, index) => {
          const isLocked = energyPoints < action.threshold;
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                {isLocked && (
                  <Lock className="h-4 w-4 mr-2 text-amber-400" />
                )}
                <span className={isLocked ? 'text-white/50' : 'text-white/90'}>
                  {action.label}
                </span>
                {isLocked && (
                  <span className="ml-2 text-xs text-amber-400">
                    ({action.threshold} points)
                  </span>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/70 hover:text-white"
                disabled={isLocked}
                onClick={() => handleActionClick(action.path)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default NodeDetailPanel;
