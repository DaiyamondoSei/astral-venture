
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import DownloadableMaterialsPanel from '@/components/home/DownloadableMaterialsPanel';

interface DownloadableMaterial {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'audio' | 'video' | 'practice' | 'guide';
  icon: React.ReactNode;
}

interface NodeDetailPanelProps {
  nodeId: string;
  energyPoints: number;
  downloadableMaterials?: DownloadableMaterial[];
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ 
  nodeId, 
  energyPoints,
  downloadableMaterials
}) => {
  // Define node details
  const nodeDetails = {
    'meditation': {
      title: 'Meditation Practices',
      description: 'Explore techniques to quiet the mind and expand consciousness.',
      practices: [
        'Mindfulness Meditation',
        'Transcendental Meditation',
        'Guided Visualization',
        'Breath Awareness'
      ]
    },
    'chakras': {
      title: 'Chakra System',
      description: 'Work with your energy centers to balance and harmonize your entire being.',
      practices: [
        'Root Chakra Grounding',
        'Heart Chakra Opening',
        'Third Eye Activation',
        'Full Chakra Alignment'
      ]
    },
    'dreams': {
      title: 'Dream Exploration',
      description: 'Uncover the wisdom of your subconscious through dream work.',
      practices: [
        'Dream Journaling',
        'Lucid Dream Techniques',
        'Dream Symbol Analysis',
        'Astral Projection from Dreams'
      ]
    },
    'energy': {
      title: 'Energy Work',
      description: 'Learn to sense, direct and cultivate your subtle energy.',
      practices: [
        'Energy Sensing',
        'Energy Circulation',
        'Aura Cleansing',
        'Energy Center Activation'
      ]
    },
    'reflection': {
      title: 'Self-Reflection',
      description: 'Deepen self-awareness through conscious introspection practices.',
      practices: [
        'Shadow Work',
        'Inner Child Healing',
        'Higher Self Connection',
        'Journaling Prompts'
      ]
    },
    'healing': {
      title: 'Healing Practices',
      description: 'Restore balance to your physical, emotional, and energetic bodies.',
      practices: [
        'Self-Healing Techniques',
        'Sound Healing',
        'Energy Healing',
        'Emotional Release'
      ]
    },
    'wisdom': {
      title: 'Cosmic Wisdom',
      description: 'Access universal knowledge and higher dimensional information.',
      practices: [
        'Channeling Practice',
        'Akashic Records Access',
        'Intuitive Development',
        'Ancient Wisdom Study'
      ]
    },
    'astral': {
      title: 'Astral Travel',
      description: 'Learn to safely navigate beyond physical limitations.',
      practices: [
        'Astral Projection Techniques',
        'Astral Body Strengthening',
        'Safe Travel Protocols',
        'Dimensional Exploration'
      ]
    },
    'sacred': {
      title: 'Sacred Geometry',
      description: 'Explore the mathematical patterns that form the fabric of reality.',
      practices: [
        'Geometric Meditation',
        'Mandala Creation',
        'Flower of Life Study',
        'Merkaba Activation'
      ]
    },
    'elements': {
      title: 'Elemental Work',
      description: 'Connect with and harness the elemental forces of nature.',
      practices: [
        'Earth Grounding',
        'Water Flow Meditation',
        'Fire Transformation',
        'Air Expansion'
      ]
    },
    'consciousness': {
      title: 'Consciousness Exploration',
      description: 'Expand your awareness beyond ordinary limitations.',
      practices: [
        'Observer Consciousness',
        'Non-Dual Awareness',
        'Quantum Consciousness',
        'Unity Consciousness'
      ]
    },
    'nature': {
      title: 'Nature Connection',
      description: 'Deepen your relationship with the natural world.',
      practices: [
        'Forest Bathing',
        'Plant Communication',
        'Nature Meditation',
        'Elemental Attunement'
      ]
    },
    'guidance': {
      title: 'Higher Guidance',
      description: 'Connect with your inner wisdom and spiritual guides.',
      practices: [
        'Inner Guidance Meditation',
        'Spirit Guide Connection',
        'Higher Self Communion',
        'Intuitive Development'
      ]
    },
    'cosmic-center': {
      title: 'Cosmic Center',
      description: 'The central point of your spiritual journey, representing your total energy and consciousness integration.',
      practices: [
        'Cosmic Meditation',
        'Energy Center Balance',
        'Consciousness Expansion',
        'Quantum Integration'
      ]
    }
  };
  
  const details = nodeDetails[nodeId] || {
    title: 'Unknown Node',
    description: 'Information about this node is not available.',
    practices: []
  };

  return (
    <div className="glass-card p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-display mb-2">{details.title}</h2>
        <p className="text-white/80 mb-6">{details.description}</p>
        
        <h3 className="text-lg font-display mb-3">Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {details.practices.map((practice, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="bg-black/20 p-3 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-quantum-500/20 flex items-center justify-center mr-2">
                  {index + 1}
                </div>
                <span>{practice}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        <Button variant="default" className="astral-button">
          <span>Begin Practice</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>

      {/* Add downloadable materials panel if available */}
      {downloadableMaterials && downloadableMaterials.length > 0 && (
        <DownloadableMaterialsPanel 
          materials={downloadableMaterials}
          nodeName={details.title}
        />
      )}
    </div>
  );
};

export default NodeDetailPanel;
