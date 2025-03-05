
import { ComponentOption } from '../hooks/useDevModeState';

// Handle component visibility toggle
export const toggleComponent = (id: string, componentOptions: ComponentOption[], setComponentOptions: React.Dispatch<React.SetStateAction<ComponentOption[]>>) => {
  setComponentOptions(prev => 
    prev.map(option => 
      option.id === id ? { ...option, isVisible: !option.isVisible } : option
    )
  );
};

// Show all components
export const showAllComponents = (setComponentOptions: React.Dispatch<React.SetStateAction<ComponentOption[]>>) => {
  setComponentOptions(prev => 
    prev.map(option => ({ ...option, isVisible: true }))
  );
};

// Hide all components
export const hideAllComponents = (setComponentOptions: React.Dispatch<React.SetStateAction<ComponentOption[]>>) => {
  setComponentOptions(prev => 
    prev.map(option => ({ ...option, isVisible: false }))
  );
};

// Reset animations
export const resetAnimations = (
  setAnimationSpeed: (value: number) => void,
  setAnimationPreset: (value: string) => void
) => {
  setAnimationSpeed(1.0);
  setAnimationPreset('smooth');
};

// Generate random configuration
export const randomizeConfig = (
  setSelectedChakras: (chakras: number[]) => void,
  setEnergyPoints: (value: number) => void,
  setShowDetails: (value: boolean) => void,
  setShowIllumination: (value: boolean) => void,
  setShowFractal: (value: boolean) => void,
  setShowTranscendence: (value: boolean) => void,
  setShowInfinity: (value: boolean) => void
) => {
  // Random chakras (1-7 chakras)
  const numChakras = Math.floor(Math.random() * 7) + 1;
  const randomChakras: number[] = [];
  const allChakras = [0, 1, 2, 3, 4, 5, 6];
  
  // Shuffle and pick
  for (let i = 0; i < numChakras; i++) {
    const availableIndices = allChakras.filter(idx => !randomChakras.includes(idx));
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    randomChakras.push(availableIndices[randomIndex]);
  }
  
  setSelectedChakras(randomChakras);
  
  // Random energies (100-1000)
  const randomEnergy = Math.floor(Math.random() * 900) + 100;
  setEnergyPoints(randomEnergy);
  
  // Random visualization settings
  setShowDetails(Math.random() > 0.2);
  setShowIllumination(Math.random() > 0.3);
  setShowFractal(Math.random() > 0.4);
  setShowTranscendence(Math.random() > 0.7);
  setShowInfinity(Math.random() > 0.8);
};

// Handle chakra intensity change
export const handleIntensityChange = (
  index: number, 
  value: number, 
  chakraIntensities: number[], 
  setChakraIntensities: React.Dispatch<React.SetStateAction<number[]>>
) => {
  const newIntensities = [...chakraIntensities];
  newIntensities[index] = value;
  setChakraIntensities(newIntensities);
};

// Handle "Show All Chakras" toggle
export const handleShowAllChakras = (
  show: boolean,
  setShowAllChakras: (value: boolean) => void,
  setSelectedChakras: (value: number[]) => void
) => {
  setShowAllChakras(show);
  if (show) {
    setSelectedChakras([0, 1, 2, 3, 4, 5, 6]);
  }
};
