
import React from 'react';
import { motion } from 'framer-motion';

interface SilhouettePartProps {
  showInfinity: boolean;
  showTranscendence: boolean;
  showIllumination: boolean;
  showFractal: boolean;
  showDetails: boolean;
  baseProgressPercentage: number;
}

const SilhouettePath: React.FC<SilhouettePartProps> = ({
  showInfinity,
  showTranscendence,
  showIllumination,
  showFractal,
  showDetails,
  baseProgressPercentage
}) => {
  // Get the appropriate glow colors based on consciousness state
  const getFillForSilhouette = () => {
    return showFractal ? "url(#fractalPattern)" : "url(#silhouetteGradient)";
  };
  
  const getStrokeClassForLevel = () => {
    if (showInfinity) return "stroke-[0.7px] stroke-blue-200/70";
    if (showTranscendence) return "stroke-[0.6px] stroke-blue-300/60";
    if (showIllumination) return "stroke-[0.5px] stroke-blue-400/50";
    return "stroke-[0.5px] stroke-blue-500/40";
  };
  
  const getFilterForLevel = () => {
    if (showInfinity) return "url(#cosmicRays)";
    if (showTranscendence) return "url(#etherealGlow)";
    return undefined;
  };

  // Animation variants for the paths
  const pathVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 1.5,
        ease: "easeOut"
      }
    }
  };

  // Animation variants for the illuminated sections
  const illuminationVariants = {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({ 
      opacity: baseProgressPercentage * custom,
      transition: { 
        duration: 2,
        ease: "easeOut",
        delay: 0.5
      }
    })
  };

  return (
    <>
      {/* Full silhouette with improved animation */}
      <motion.path 
        d="M50,30 
          C58,30 64,24 64,16 
          C64,8 58,2 50,2 
          C42,2 36,8 36,16 
          C36,24 42,30 50,30 
          Z 
          M38,32 L62,32 
          L64,45 L36,45 
          Z 
          M36,45 L64,45 
          L68,100 L32,100 
          Z
          M32,100 L40,100 L36,140 L28,140 
          Z
          M68,100 L60,100 L64,140 L72,140 
          Z
          M36,140 L28,140 L30,170 L38,170 
          Z
          M64,140 L72,140 L70,170 L62,170 
          Z"
        fill={getFillForSilhouette()}
        className={`astral-body-silhouette ${getStrokeClassForLevel()}`}
        filter={getFilterForLevel()}
        initial="hidden"
        animate="visible"
        variants={pathVariants}
      />
      
      {/* Illuminated body segments with enhanced animation */}
      {showDetails && (
        <>
          <motion.path 
            d="M50,30 C58,30 64,24 64,16 C64,8 58,2 50,2 C42,2 36,8 36,16 C36,24 42,30 50,30 Z"
            fill="url(#centerGlow)"
            className="astral-body-head"
            initial="hidden"
            animate="visible"
            custom={0.9}
            variants={illuminationVariants}
          />
          <motion.path 
            d="M38,32 L62,32 L64,45 L36,45 Z"
            fill="url(#centerGlow)"
            className="astral-body-chest"
            initial="hidden"
            animate="visible"
            custom={0.8}
            variants={illuminationVariants}
          />
          <motion.path 
            d="M36,45 L64,45 L68,100 L32,100 Z"
            fill="url(#centerGlow)"
            className="astral-body-torso"
            initial="hidden"
            animate="visible"
            custom={0.7}
            variants={illuminationVariants}
          />
          
          {/* Fractal level adds more detailed body illumination */}
          {showFractal && (
            <>
              <motion.path 
                d="M32,100 L40,100 L36,140 L28,140 Z"
                fill="url(#centerGlow)"
                className="astral-body-leg-left"
                initial="hidden"
                animate="visible"
                custom={0.6}
                variants={illuminationVariants}
              />
              <motion.path 
                d="M68,100 L60,100 L64,140 L72,140 Z"
                fill="url(#centerGlow)"
                className="astral-body-leg-right"
                initial="hidden"
                animate="visible"
                custom={0.6}
                variants={illuminationVariants}
              />
            </>
          )}
          
          {/* Transcendence level completes the body illumination */}
          {showTranscendence && (
            <>
              <motion.path 
                d="M36,140 L28,140 L30,170 L38,170 Z"
                fill="url(#centerGlow)"
                className="astral-body-foot-left"
                initial="hidden"
                animate="visible"
                custom={0.5}
                variants={illuminationVariants}
              />
              <motion.path 
                d="M64,140 L72,140 L70,170 L62,170 Z"
                fill="url(#centerGlow)"
                className="astral-body-foot-right"
                initial="hidden"
                animate="visible"
                custom={0.5}
                variants={illuminationVariants}
              />
            </>
          )}
          
          {/* Add energy aura for highest consciousness levels */}
          {showInfinity && (
            <motion.path 
              d="M50,185 
                C85,185 110,160 110,125 
                C110,90 85,65 50,65 
                C15,65 -10,90 -10,125 
                C-10,160 15,185 50,185 Z"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.5"
              strokeDasharray="1 2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 0.7 * baseProgressPercentage, 
                scale: 1,
                transition: { 
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
            />
          )}
        </>
      )}
    </>
  );
};

export default SilhouettePath;
