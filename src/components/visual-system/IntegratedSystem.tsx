
import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntegratedSystemState } from '@/hooks/useIntegratedSystemState';
import type { ChakraType } from '@/types/chakra/ChakraSystemTypes';
import { isSuccess } from '@/utils/result/Result';

interface IntegratedSystemProps {
  initialEngine?: 'svg' | 'canvas' | 'webgl';
  chakraActivations?: Record<ChakraType, number>;
  showQuantumEffects?: boolean;
  adaptToPerformance?: boolean;
  className?: string;
}

export const IntegratedSystem: React.FC<IntegratedSystemProps> = ({
  initialEngine = 'svg',
  chakraActivations = {},
  showQuantumEffects = false,
  adaptToPerformance = true,
  className = ''
}) => {
  // Initialize integrated system state
  const systemResult = useIntegratedSystemState({
    initialVisualEngine: initialEngine,
    chakraActivations,
    enableQuantumEffects: showQuantumEffects,
    adaptToPerformance
  });

  // Early return for failure case
  if (!isSuccess(systemResult)) {
    console.error('Failed to initialize integrated system:', systemResult.error);
    return null;
  }

  const {
    visualSystem,
    chakraSystem,
    renderingQuality,
    synchronizeChakraToVisual
  } = systemResult.value;

  // Synchronize chakra and visual states
  useEffect(() => {
    synchronizeChakraToVisual();
  }, [chakraSystem.chakras.activationStates, synchronizeChakraToVisual]);

  // Generate particle effect styles based on quality
  const particleStyles = useMemo(() => ({
    count: renderingQuality === 'low' ? 50 : renderingQuality === 'medium' ? 100 : 200,
    blur: renderingQuality === 'low' ? '0px' : renderingQuality === 'medium' ? '1px' : '2px',
    scale: renderingQuality === 'low' ? 0.8 : renderingQuality === 'medium' ? 1 : 1.2
  }), [renderingQuality]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Background Layer */}
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Particle Effects Layer */}
      <AnimatePresence>
        {visualSystem.visualStates.transcendence.active && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Particle effects here */}
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, 
                  rgba(138, 43, 226, 0.2), 
                  rgba(0, 0, 0, 0)
                )`,
                filter: `blur(${particleStyles.blur})`
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chakra Visualization Layer */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Object.entries(chakraSystem.chakras.activationStates).map(([chakra, status]) => (
          <motion.div
            key={chakra}
            className="absolute"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: status.activationPercentage > 0 ? 1 : 0.8,
              opacity: status.activationPercentage / 100
            }}
            transition={{ duration: 0.5 }}
          >
            {/* Chakra visualization here */}
            <div 
              className={`rounded-full ${
                status.activationPercentage > 80 ? 'bg-purple-500' :
                status.activationPercentage > 60 ? 'bg-blue-500' :
                status.activationPercentage > 40 ? 'bg-green-500' :
                status.activationPercentage > 20 ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}
              style={{
                width: `${Math.max(20, status.activationPercentage/2)}px`,
                height: `${Math.max(20, status.activationPercentage/2)}px`,
                filter: `blur(${particleStyles.blur})`,
                transform: `scale(${particleStyles.scale})`
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Quantum Effects Layer */}
      {showQuantumEffects && chakraSystem.quantumStates && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Quantum visualization effects here */}
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: `radial-gradient(circle at 50% 50%, 
                rgba(0, 191, 255, 0.1), 
                rgba(0, 0, 0, 0)
              )`,
              filter: `blur(${particleStyles.blur})`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default IntegratedSystem;
