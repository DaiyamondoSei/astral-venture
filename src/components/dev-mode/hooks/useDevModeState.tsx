
import { useState } from 'react';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';

export interface ComponentOption {
  id: string;
  name: string;
  description: string;
  isVisible: boolean;
}

export const useDevModeState = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [energyPoints, setEnergyPoints] = useState(300);
  const [selectedChakras, setSelectedChakras] = useState<number[]>([0, 3, 6]);
  const [showAllChakras, setShowAllChakras] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showIllumination, setShowIllumination] = useState(true);
  const [showFractal, setShowFractal] = useState(true);
  const [showTranscendence, setShowTranscendence] = useState(false);
  const [showInfinity, setShowInfinity] = useState(false);
  
  // Advanced settings states
  const [chakraIntensities, setChakraIntensities] = useState<number[]>([1, 1, 1, 1, 1, 1, 1]);
  const [fractalComplexity, setFractalComplexity] = useState(5);
  const [glowIntensity, setGlowIntensity] = useState(0.7);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [animationPreset, setAnimationPreset] = useState('smooth');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isolationMode, setIsolationMode] = useState(false);
  
  // Component isolation options
  const [componentOptions, setComponentOptions] = useState<ComponentOption[]>([
    { id: 'silhouette', name: 'Human Silhouette', description: 'Base human form', isVisible: true },
    { id: 'chakras', name: 'Chakra Points', description: 'Energy centers', isVisible: true },
    { id: 'aura', name: 'Aura Field', description: 'Surrounding energy', isVisible: true },
    { id: 'rays', name: 'Energy Rays', description: 'Emanating light', isVisible: true },
    { id: 'fractal', name: 'Fractal Patterns', description: 'Complex geometries', isVisible: true },
    { id: 'stars', name: 'Background Stars', description: 'Cosmic backdrop', isVisible: true },
    { id: 'glow', name: 'Central Glow', description: 'Core energy', isVisible: true },
  ]);

  // Calculate chakra intensity based on selected chakras
  const getChakraIntensity = (chakraIndex: number) => {
    if (showAllChakras) return 1;
    return selectedChakras.includes(chakraIndex) ? chakraIntensities[chakraIndex] : 0.3;
  };

  return {
    isExpanded,
    setIsExpanded,
    energyPoints,
    setEnergyPoints,
    selectedChakras,
    setSelectedChakras,
    showAllChakras,
    setShowAllChakras,
    showDetails,
    setShowDetails,
    showIllumination,
    setShowIllumination,
    showFractal,
    setShowFractal,
    showTranscendence,
    setShowTranscendence,
    showInfinity,
    setShowInfinity,
    chakraIntensities,
    setChakraIntensities,
    fractalComplexity,
    setFractalComplexity,
    glowIntensity,
    setGlowIntensity,
    animationSpeed,
    setAnimationSpeed,
    animationsEnabled,
    setAnimationsEnabled,
    animationPreset,
    setAnimationPreset,
    isMonitoring,
    setIsMonitoring,
    isolationMode,
    setIsolationMode,
    componentOptions,
    setComponentOptions,
    getChakraIntensity
  };
};
