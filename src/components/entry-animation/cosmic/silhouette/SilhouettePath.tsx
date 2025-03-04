
import React from 'react';
import { SilhouettePartProps } from './types';
import { getFillForSilhouette, getFilterForLevel, getStrokeClassForLevel } from './utils';

const SilhouettePath: React.FC<SilhouettePartProps> = ({
  showInfinity,
  showTranscendence,
  showIllumination,
  showFractal,
  showDetails,
  baseProgressPercentage
}) => {
  return (
    <>
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
        fill={getFillForSilhouette(showFractal)}
        className={`astral-body-silhouette ${getStrokeClassForLevel(showInfinity, showTranscendence, showIllumination)}`}
        filter={getFilterForLevel(showInfinity, showTranscendence)}
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
    </>
  );
};

export default SilhouettePath;
