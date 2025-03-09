
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAdaptivePerformance } from '@/contexts/AdaptivePerformanceContext';

export type QuantumTheme = 'quantum' | 'astral' | 'ethereal' | 'default';
export type QuantumAccent = 'purple' | 'blue' | 'green' | 'pink' | 'gold';
export type QuantumContrast = 'low' | 'medium' | 'high';
export type QuantumAnimationLevel = 'minimal' | 'balanced' | 'immersive';

interface QuantumThemeContextType {
  theme: QuantumTheme;
  accent: QuantumAccent;
  contrast: QuantumContrast;
  animationLevel: QuantumAnimationLevel;
  glassmorphismLevel: 'low' | 'medium' | 'high';
  cosmicIntensity: 'low' | 'medium' | 'high';
  setTheme: (theme: QuantumTheme) => void;
  setAccent: (accent: QuantumAccent) => void;
  setContrast: (contrast: QuantumContrast) => void;
  setAnimationLevel: (level: QuantumAnimationLevel) => void;
  setGlassmorphismLevel: (level: 'low' | 'medium' | 'high') => void;
  setCosmicIntensity: (intensity: 'low' | 'medium' | 'high') => void;
  getPrimaryColor: () => string;
  getSecondaryColor: () => string;
  getBackgroundGradient: () => string;
  getTextColor: () => string;
}

const defaultContextValue: QuantumThemeContextType = {
  theme: 'quantum',
  accent: 'purple',
  contrast: 'medium',
  animationLevel: 'balanced',
  glassmorphismLevel: 'medium',
  cosmicIntensity: 'medium',
  setTheme: () => {},
  setAccent: () => {},
  setContrast: () => {},
  setAnimationLevel: () => {},
  setGlassmorphismLevel: () => {},
  setCosmicIntensity: () => {},
  getPrimaryColor: () => '#7C3AED',
  getSecondaryColor: () => '#A78BFA',
  getBackgroundGradient: () => 'from-[#221F26] via-[#2C2B33] to-[#191A23]',
  getTextColor: () => '#FFFFFF',
};

const QuantumThemeContext = createContext<QuantumThemeContextType>(defaultContextValue);

export const useQuantumTheme = () => useContext(QuantumThemeContext);

interface QuantumThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: QuantumTheme;
  initialAccent?: QuantumAccent;
  initialContrast?: QuantumContrast;
}

export const QuantumThemeProvider: React.FC<QuantumThemeProviderProps> = ({
  children,
  initialTheme = 'quantum',
  initialAccent = 'purple',
  initialContrast = 'medium',
}) => {
  const [theme, setTheme] = useState<QuantumTheme>(initialTheme);
  const [accent, setAccent] = useState<QuantumAccent>(initialAccent);
  const [contrast, setContrast] = useState<QuantumContrast>(initialContrast);
  const [animationLevel, setAnimationLevel] = useState<QuantumAnimationLevel>('balanced');
  const [glassmorphismLevel, setGlassmorphismLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [cosmicIntensity, setCosmicIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  
  const adaptivePerf = useAdaptivePerformance();
  
  // Adjust visual settings based on device capability
  useEffect(() => {
    if (!adaptivePerf) return;
    
    const { deviceCapability } = adaptivePerf;
    
    // Adapt animation level based on device capability
    if (deviceCapability === 'LOW') {
      setAnimationLevel('minimal');
      setGlassmorphismLevel('low');
      setCosmicIntensity('low');
    } else if (deviceCapability === 'MEDIUM') {
      setAnimationLevel('balanced');
      setGlassmorphismLevel('medium');
      setCosmicIntensity('medium');
    } else {
      setAnimationLevel('immersive');
      setGlassmorphismLevel('high');
      setCosmicIntensity('high');
    }
  }, [adaptivePerf]);
  
  // Theme color mapping functions
  const getPrimaryColor = () => {
    // Map theme and accent to primary colors
    if (theme === 'quantum') {
      return accent === 'purple' ? '#7C3AED' : 
             accent === 'blue' ? '#3B82F6' : 
             accent === 'green' ? '#10B981' : 
             accent === 'pink' ? '#EC4899' : '#F59E0B';
    } else if (theme === 'astral') {
      return accent === 'purple' ? '#6D28D9' : 
             accent === 'blue' ? '#2563EB' : 
             accent === 'green' ? '#059669' : 
             accent === 'pink' ? '#DB2777' : '#D97706';
    } else if (theme === 'ethereal') {
      return accent === 'purple' ? '#8B5CF6' : 
             accent === 'blue' ? '#60A5FA' : 
             accent === 'green' ? '#34D399' : 
             accent === 'pink' ? '#F472B6' : '#FBBF24';
    }
    return '#7C3AED'; // Default
  };
  
  const getSecondaryColor = () => {
    // Map theme and accent to secondary colors
    if (theme === 'quantum') {
      return accent === 'purple' ? '#A78BFA' : 
             accent === 'blue' ? '#93C5FD' : 
             accent === 'green' ? '#6EE7B7' : 
             accent === 'pink' ? '#F9A8D4' : '#FCD34D';
    } else if (theme === 'astral') {
      return accent === 'purple' ? '#8B5CF6' : 
             accent === 'blue' ? '#60A5FA' : 
             accent === 'green' ? '#34D399' : 
             accent === 'pink' ? '#F472B6' : '#FBBF24';
    } else if (theme === 'ethereal') {
      return accent === 'purple' ? '#C4B5FD' : 
             accent === 'blue' ? '#BFDBFE' : 
             accent === 'green' ? '#A7F3D0' : 
             accent === 'pink' ? '#FBCFE8' : '#FDE68A';
    }
    return '#A78BFA'; // Default
  };
  
  const getBackgroundGradient = () => {
    // Map theme to background gradients
    if (theme === 'quantum') {
      return 'from-[#221F26] via-[#2C2B33] to-[#191A23]';
    } else if (theme === 'astral') {
      return 'from-[#030014] via-[#0F0527] to-[#10031c]';
    } else if (theme === 'ethereal') {
      return 'from-[#040720] via-[#0F1A40] to-[#0A0F33]';
    }
    return 'from-[#221F26] via-[#2C2B33] to-[#191A23]'; // Default
  };
  
  const getTextColor = () => {
    // Map contrast to text colors
    if (contrast === 'low') {
      return '#E5E7EB';
    } else if (contrast === 'medium') {
      return '#FFFFFF';
    } else {
      return '#FFFFFF';
    }
  };
  
  const contextValue: QuantumThemeContextType = {
    theme,
    accent,
    contrast,
    animationLevel,
    glassmorphismLevel,
    cosmicIntensity,
    setTheme,
    setAccent,
    setContrast,
    setAnimationLevel,
    setGlassmorphismLevel,
    setCosmicIntensity,
    getPrimaryColor,
    getSecondaryColor,
    getBackgroundGradient,
    getTextColor,
  };
  
  return (
    <QuantumThemeContext.Provider value={contextValue}>
      {children}
    </QuantumThemeContext.Provider>
  );
};

export default QuantumThemeProvider;
