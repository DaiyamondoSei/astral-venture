
import React from 'react';
import { motion } from 'framer-motion';
import { generateEnergyColor } from './colorUtils';
import { EnergyLevelProps } from './types';

interface HumanSilhouetteProps extends Pick<EnergyLevelProps, 'showChakras' | 'showDetails' | 'showIllumination' | 'showFractal' | 'showTranscendence' | 'showInfinity' | 'baseProgressPercentage'> {
  getChakraIntensity: (baseChakraLevel: number) => number;
}

const HumanSilhouette: React.FC<HumanSilhouetteProps> = ({
  showChakras,
  showDetails,
  showIllumination,
  showFractal,
  showTranscendence,
  showInfinity,
  baseProgressPercentage,
  getChakraIntensity
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative h-4/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <svg 
          className="h-full mx-auto astral-body-silhouette"
          viewBox="0 0 100 220" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="silhouetteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={showInfinity ? "rgba(180, 220, 255, 0.2)" : showTranscendence ? "rgba(140, 200, 255, 0.18)" : showIllumination ? "rgba(86, 219, 228, 0.15)" : "rgba(56, 189, 248, 0.1)"} />
              <stop offset="50%" stopColor={showDetails ? "rgba(56, 189, 248, 0.05)" : "rgba(56, 189, 248, 0)"} />
              <stop offset="100%" stopColor={showInfinity ? "rgba(180, 220, 255, 0.2)" : showTranscendence ? "rgba(140, 200, 255, 0.18)" : showIllumination ? "rgba(86, 219, 228, 0.15)" : "rgba(56, 189, 248, 0.1)"} />
            </linearGradient>
            
            {/* More advanced gradients at higher levels */}
            {showDetails && (
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor={showInfinity ? "rgba(140, 180, 255, 0.5)" : showTranscendence ? "rgba(100, 150, 255, 0.4)" : "rgba(56, 189, 248, 0.3)"} />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
              </radialGradient>
            )}
            
            {showIllumination && (
              <linearGradient id="chakraGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={showInfinity ? "rgba(180, 100, 255, 0.8)" : showTranscendence ? "rgba(160, 80, 255, 0.75)" : "rgba(147, 51, 234, 0.7)"} />
                <stop offset="50%" stopColor={showInfinity ? "rgba(100, 160, 255, 0.8)" : showTranscendence ? "rgba(80, 140, 255, 0.75)" : "rgba(59, 130, 246, 0.7)"} />
                <stop offset="100%" stopColor={showInfinity ? "rgba(255, 100, 180, 0.8)" : showTranscendence ? "rgba(255, 80, 170, 0.75)" : "rgba(236, 72, 153, 0.7)"} />
              </linearGradient>
            )}
            
            {/* Fractal level adds complex patterns */}
            {showFractal && (
              <pattern id="fractalPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(100, 180, 255, 0.4)" strokeWidth="0.5" />
                <circle cx="10" cy="10" r="4" fill="none" stroke="rgba(120, 200, 255, 0.3)" strokeWidth="0.3" />
                <circle cx="10" cy="10" r="1" fill="rgba(140, 220, 255, 0.5)" />
              </pattern>
            )}
            
            {/* Transcendence level adds ethereal glow */}
            {showTranscendence && (
              <filter id="etherealGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feColorMatrix 
                  in="blur" 
                  type="matrix" 
                  values="0 0 0 0 0.5 0 0 0 0 0.8 0 0 0 0 1 0 0 0 0.7 0"
                  result="coloredBlur" 
                />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
            
            {/* Infinity level adds cosmic rays */}
            {showInfinity && (
              <>
                <filter id="cosmicRays">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feColorMatrix 
                    in="blur" 
                    type="matrix" 
                    values="0 0 0 0 0.7 0 0 0 0 0.9 0 0 0 0 1 0 0 0 0.9 0"
                    result="coloredBlur" 
                  />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                
                <radialGradient id="infiniteGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                  <stop offset="30%" stopColor="rgba(180, 220, 255, 0.7)" />
                  <stop offset="70%" stopColor="rgba(140, 180, 255, 0.4)" />
                  <stop offset="100%" stopColor="rgba(100, 140, 255, 0)" />
                </radialGradient>
              </>
            )}
          </defs>
          
          {/* Full silhouette */}
          <path 
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
            fill={showFractal ? "url(#fractalPattern)" : "url(#silhouetteGradient)"}
            className={`astral-body-silhouette ${
              showInfinity 
                ? 'stroke-violet-300/40 stroke-[0.4]' 
                : showTranscendence 
                  ? 'stroke-indigo-300/35 stroke-[0.35]' 
                  : showIllumination 
                    ? 'stroke-cyan-300/30 stroke-[0.3]' 
                    : ''
            }`}
            filter={showInfinity 
              ? "url(#cosmicRays)" 
              : showTranscendence 
                ? "url(#etherealGlow)" 
                : undefined
            }
          />
          
          {/* Illuminated body segments that appear at higher levels */}
          {showDetails && (
            <>
              <path 
                d="M50,30 C58,30 64,24 64,16 C64,8 58,2 50,2 C42,2 36,8 36,16 C36,24 42,30 50,30 Z"
                fill="url(#centerGlow)"
                className="astral-body-head"
                opacity={baseProgressPercentage * 0.8}
              />
              <path 
                d="M38,32 L62,32 L64,45 L36,45 Z"
                fill="url(#centerGlow)"
                className="astral-body-chest"
                opacity={baseProgressPercentage * 0.7}
              />
              <path 
                d="M36,45 L64,45 L68,100 L32,100 Z"
                fill="url(#centerGlow)"
                className="astral-body-torso"
                opacity={baseProgressPercentage * 0.6}
              />
              
              {/* Fractal level adds more detailed body illumination */}
              {showFractal && (
                <>
                  <path 
                    d="M32,100 L40,100 L36,140 L28,140 Z"
                    fill="url(#centerGlow)"
                    className="astral-body-leg-left"
                    opacity={baseProgressPercentage * 0.5}
                  />
                  <path 
                    d="M68,100 L60,100 L64,140 L72,140 Z"
                    fill="url(#centerGlow)"
                    className="astral-body-leg-right"
                    opacity={baseProgressPercentage * 0.5}
                  />
                </>
              )}
              
              {/* Transcendence level completes the body illumination */}
              {showTranscendence && (
                <>
                  <path 
                    d="M36,140 L28,140 L30,170 L38,170 Z"
                    fill="url(#centerGlow)"
                    className="astral-body-foot-left"
                    opacity={baseProgressPercentage * 0.5}
                  />
                  <path 
                    d="M64,140 L72,140 L70,170 L62,170 Z"
                    fill="url(#centerGlow)"
                    className="astral-body-foot-right"
                    opacity={baseProgressPercentage * 0.5}
                  />
                </>
              )}
            </>
          )}
          
          {/* Energy points/chakras with intensity based on progress */}
          <circle 
            cx="50" cy="16" r={showChakras ? 2.5 : 2} 
            className="energy-point crown-chakra" 
            fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8", 1, showInfinity, showTranscendence, showFractal, showIllumination)}
            opacity={getChakraIntensity(0)}
            filter={showInfinity ? "url(#cosmicRays)" : undefined}
          >
            {showChakras && (
              <animate 
                attributeName="r"
                values={`${2};${2.5 + baseProgressPercentage};${2}`}
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          
          <circle 
            cx="50" cy="32" r={showChakras ? 2.5 : 2}
            className="energy-point throat-chakra" 
            fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8", 1, showInfinity, showTranscendence, showFractal, showIllumination)}
            opacity={getChakraIntensity(1)}
            filter={showInfinity ? "url(#cosmicRays)" : undefined}
          >
            {showChakras && (
              <animate 
                attributeName="r"
                values={`${2};${2.5 + baseProgressPercentage};${2}`}
                dur="3.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          
          <circle 
            cx="50" cy="55" r={showChakras ? 3 : 2.5}
            className="energy-point heart-chakra" 
            fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8", 1, showInfinity, showTranscendence, showFractal, showIllumination)}
            opacity={getChakraIntensity(2)}
            filter={showInfinity ? "url(#cosmicRays)" : undefined}
          >
            {showChakras && (
              <animate 
                attributeName="r"
                values={`${2.5};${3 + baseProgressPercentage};${2.5}`}
                dur="4s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          
          <circle 
            cx="50" cy="70" r={showChakras ? 2.5 : 2}
            className="energy-point solar-chakra" 
            fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8", 1, showInfinity, showTranscendence, showFractal, showIllumination)}
            opacity={getChakraIntensity(3)}
            filter={showInfinity ? "url(#cosmicRays)" : undefined}
          >
            {showChakras && (
              <animate 
                attributeName="r"
                values={`${2};${2.5 + baseProgressPercentage};${2}`}
                dur="3.8s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          
          <circle 
            cx="50" cy="85" r={showChakras ? 2.5 : 2}
            className="energy-point sacral-chakra" 
            fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8", 1, showInfinity, showTranscendence, showFractal, showIllumination)}
            opacity={getChakraIntensity(4)}
            filter={showInfinity ? "url(#cosmicRays)" : undefined}
          >
            {showChakras && (
              <animate 
                attributeName="r"
                values={`${2};${2.5 + baseProgressPercentage};${2}`}
                dur="3.2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          
          <circle 
            cx="50" cy="100" r={showChakras ? 3 : 2.5}
            className="energy-point root-chakra" 
            fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8", 1, showInfinity, showTranscendence, showFractal, showIllumination)}
            opacity={getChakraIntensity(5)}
            filter={showInfinity ? "url(#cosmicRays)" : undefined}
          >
            {showChakras && (
              <animate 
                attributeName="r"
                values={`${2.5};${3 + baseProgressPercentage};${2.5}`}
                dur="4.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          
          {/* Infinity level core essence */}
          {showInfinity && (
            <circle 
              cx="50" cy="55" r="4"
              fill="url(#infiniteGlow)"
              opacity="0.9"
            >
              <animate 
                attributeName="r"
                values="3;5;3"
                dur="5s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>
        
        {/* Central glow behind the silhouette */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            className={`w-1/2 h-1/2 rounded-full blur-xl ${
              showInfinity 
                ? 'bg-gradient-to-t from-blue-500/40 to-violet-400/40'
                : showTranscendence 
                  ? 'bg-gradient-to-t from-blue-500/35 to-indigo-400/35'
                  : showIllumination 
                    ? 'bg-gradient-to-t from-blue-500/30 to-cyan-400/30'
                    : 'bg-gradient-to-t from-blue-500/20 to-cyan-400/20'
            }`}
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: [0.3, 0.3 + (baseProgressPercentage * 0.5), 0.3],
              scale: [0.9, 1 + (baseProgressPercentage * 0.2), 0.9],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default HumanSilhouette;
