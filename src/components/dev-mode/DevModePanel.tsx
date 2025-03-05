
import React from 'react';
import { motion } from 'framer-motion';
import { useDevModeState } from './hooks/useDevModeState';
import DevModePanelHeader from './components/DevModePanelHeader';
import DevModePanelFooter from './components/DevModePanelFooter';
import DevModeTabs from './components/DevModeTabs';
import { 
  toggleComponent, 
  showAllComponents, 
  hideAllComponents,
  resetAnimations,
  randomizeConfig,
  handleIntensityChange,
  handleShowAllChakras 
} from './utils/devModeUtils';

interface DevModePanelProps {
  onClose: () => void;
}

const DevModePanel: React.FC<DevModePanelProps> = ({ onClose }) => {
  const {
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
  } = useDevModeState();
  
  // Handle chakra intensity change using the utility
  const handleChakraIntensityChange = (index: number, value: number) => {
    handleIntensityChange(index, value, chakraIntensities, setChakraIntensities);
  };
  
  // Handle "Show All Chakras" toggle using the utility
  const handleShowAll = (show: boolean) => {
    handleShowAllChakras(show, setShowAllChakras, setSelectedChakras);
  };
  
  // Handle component visibility toggle using the utility
  const handleToggleComponent = (id: string) => {
    toggleComponent(id, componentOptions, setComponentOptions);
  };
  
  // Show all components using the utility
  const handleShowAllComponents = () => {
    showAllComponents(setComponentOptions);
  };
  
  // Hide all components using the utility
  const handleHideAllComponents = () => {
    hideAllComponents(setComponentOptions);
  };
  
  // Reset animations using the utility
  const handleResetAnimations = () => {
    resetAnimations(setAnimationSpeed, setAnimationPreset);
  };
  
  // Generate random configuration using the utility
  const handleRandomize = () => {
    randomizeConfig(
      setSelectedChakras,
      setEnergyPoints,
      setShowDetails,
      setShowIllumination,
      setShowFractal,
      setShowTranscendence,
      setShowInfinity
    );
  };
  
  return (
    <motion.div 
      className={`fixed right-0 top-0 h-full bg-black/95 border-l border-white/10 
        backdrop-blur-md shadow-2xl z-50 flex flex-col overflow-hidden transition-all
        ${isExpanded ? 'w-full md:w-2/3 lg:w-1/2' : 'w-full sm:w-96'}`}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <DevModePanelHeader 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded} 
        onClose={onClose} 
      />
      
      <div className="flex-1 overflow-y-auto">
        <DevModeTabs 
          energyPoints={energyPoints}
          setEnergyPoints={setEnergyPoints}
          selectedChakras={selectedChakras}
          setSelectedChakras={setSelectedChakras}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          showIllumination={showIllumination}
          setShowIllumination={setShowIllumination}
          showFractal={showFractal}
          setShowFractal={setShowFractal}
          showTranscendence={showTranscendence}
          setShowTranscendence={setShowTranscendence}
          showInfinity={showInfinity}
          setShowInfinity={setShowInfinity}
          chakraIntensities={chakraIntensities}
          handleIntensityChange={handleChakraIntensityChange}
          fractalComplexity={fractalComplexity}
          setFractalComplexity={setFractalComplexity}
          glowIntensity={glowIntensity}
          setGlowIntensity={setGlowIntensity}
          getChakraIntensity={getChakraIntensity}
          handleRandomize={handleRandomize}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          animationsEnabled={animationsEnabled}
          setAnimationsEnabled={setAnimationsEnabled}
          animationPreset={animationPreset}
          setAnimationPreset={setAnimationPreset}
          onResetAnimations={handleResetAnimations}
          componentOptions={componentOptions}
          onToggleComponent={handleToggleComponent}
          isolationMode={isolationMode}
          setIsolationMode={setIsolationMode}
          onShowAll={handleShowAllComponents}
          onHideAll={handleHideAllComponents}
          isMonitoring={isMonitoring}
          setIsMonitoring={setIsMonitoring}
        />
      </div>
      
      <DevModePanelFooter onClose={onClose} />
    </motion.div>
  );
};

export default DevModePanel;
