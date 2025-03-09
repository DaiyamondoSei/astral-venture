
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePerfConfig } from '@/hooks/usePerfConfig';

// Theme types
export type QuantumTheme = 'quantum' | 'astral' | 'ethereal' | 'default';
export type QuantumAccent = 'purple' | 'blue' | 'green' | 'pink' | 'gold';
export type QuantumContrast = 'low' | 'medium' | 'high';
export type QuantumAnimationLevel = 'minimal' | 'balanced' | 'immersive';

// Context type
interface QuantumThemeContextType {
  // Theme state
  theme: QuantumTheme;
  accent: QuantumAccent;
  contrast: QuantumContrast;
  cosmicIntensity: 'low' | 'medium' | 'high';
  glassmorphismLevel: 'low' | 'medium' | 'high';
  animationLevel: QuantumAnimationLevel;
  
  // Theme setters
  setTheme: (theme: QuantumTheme) => void;
  setAccent: (accent: QuantumAccent) => void;
  setContrast: (contrast: QuantumContrast) => void;
  setCosmicIntensity: (intensity: 'low' | 'medium' | 'high') => void;
  setGlassmorphismLevel: (level: 'low' | 'medium' | 'high') => void;
  setAnimationLevel: (level: QuantumAnimationLevel) => void;
  
  // Helper functions
  getPrimaryColor: () => string;
  getSecondaryColor: () => string;
  getAccentColor: () => string;
}

// Create context with default values
const QuantumThemeContext = createContext<QuantumThemeContextType>({
  theme: 'quantum',
  accent: 'purple',
  contrast: 'medium',
  cosmicIntensity: 'medium',
  glassmorphismLevel: 'medium',
  animationLevel: 'balanced',
  
  setTheme: () => {},
  setAccent: () => {},
  setContrast: () => {},
  setCosmicIntensity: () => {},
  setGlassmorphismLevel: () => {},
  setAnimationLevel: () => {},
  
  getPrimaryColor: () => '#A855F7',
  getSecondaryColor: () => '#3B82F6',
  getAccentColor: () => '#8B5CF6',
});

// Provider component
interface QuantumThemeProviderProps {
  children: ReactNode;
  defaultTheme?: QuantumTheme;
  defaultAccent?: QuantumAccent;
}

const QuantumThemeProvider: React.FC<QuantumThemeProviderProps> = ({
  children,
  defaultTheme = 'quantum',
  defaultAccent = 'purple',
}) => {
  const { config } = usePerfConfig();
  
  // State for theme properties
  const [theme, setTheme] = useState<QuantumTheme>(defaultTheme);
  const [accent, setAccent] = useState<QuantumAccent>(defaultAccent);
  const [contrast, setContrast] = useState<QuantumContrast>('medium');
  const [cosmicIntensity, setCosmicIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [glassmorphismLevel, setGlassmorphismLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [animationLevel, setAnimationLevel] = useState<QuantumAnimationLevel>('balanced');
  
  // Adjust settings based on device capability
  useEffect(() => {
    // Handle low-end devices
    if (config.deviceCapability === 'low') {
      setCosmicIntensity('low');
      setGlassmorphismLevel('low');
      setAnimationLevel('minimal');
    }
    // Handle mid-range devices
    else if (config.deviceCapability === 'medium') {
      if (animationLevel === 'immersive') {
        setAnimationLevel('balanced');
      }
    }
    // High-end devices can handle all settings
  }, [config.deviceCapability]);
  
  // Color getters
  const getPrimaryColor = (): string => {
    switch (theme) {
      case 'quantum':
        return accent === 'purple' ? '#A855F7' : 
               accent === 'blue' ? '#3B82F6' : 
               accent === 'green' ? '#10B981' : 
               accent === 'pink' ? '#EC4899' : 
               accent === 'gold' ? '#F59E0B' : '#A855F7';
      case 'astral':
        return accent === 'purple' ? '#8B5CF6' : 
               accent === 'blue' ? '#60A5FA' : 
               accent === 'green' ? '#34D399' : 
               accent === 'pink' ? '#F472B6' : 
               accent === 'gold' ? '#FBBF24' : '#60A5FA';
      case 'ethereal':
        return accent === 'purple' ? '#C4B5FD' : 
               accent === 'blue' ? '#93C5FD' : 
               accent === 'green' ? '#6EE7B7' : 
               accent === 'pink' ? '#F9A8D4' : 
               accent === 'gold' ? '#FCD34D' : '#6EE7B7';
      default:
        return '#A855F7';
    }
  };
  
  const getSecondaryColor = (): string => {
    switch (theme) {
      case 'quantum':
        return '#3B82F6';
      case 'astral':
        return '#8B5CF6';
      case 'ethereal':
        return '#06B6D4';
      default:
        return '#3B82F6';
    }
  };
  
  const getAccentColor = (): string => {
    switch (accent) {
      case 'purple': return '#8B5CF6';
      case 'blue': return '#3B82F6';
      case 'green': return '#10B981';
      case 'pink': return '#EC4899';
      case 'gold': return '#F59E0B';
      default: return '#8B5CF6';
    }
  };
  
  const contextValue: QuantumThemeContextType = {
    theme,
    accent,
    contrast,
    cosmicIntensity,
    glassmorphismLevel,
    animationLevel,
    setTheme,
    setAccent,
    setContrast,
    setCosmicIntensity,
    setGlassmorphismLevel,
    setAnimationLevel,
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
  };
  
  return (
    <QuantumThemeContext.Provider value={contextValue}>
      {children}
    </QuantumThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useQuantumTheme = () => {
  const context = useContext(QuantumThemeContext);
  if (!context) {
    throw new Error('useQuantumTheme must be used within a QuantumThemeProvider');
  }
  return context;
};

export default QuantumThemeProvider;
