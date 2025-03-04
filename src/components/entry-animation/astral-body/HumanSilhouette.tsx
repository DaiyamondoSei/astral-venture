
import React from 'react';

const HumanSilhouette: React.FC = () => {
  return (
    <>
      {/* Head */}
      <circle cx="100" cy="60" r="30" className="astral-body-part" />
      
      {/* Neck */}
      <path d="M90 90 L110 90 L108 105 L92 105 Z" className="astral-body-part" />
      
      {/* Torso */}
      <path d="M75 105 L125 105 L135 200 L65 200 Z" className="astral-body-part" />
      
      {/* Arms */}
      <path d="M75 115 L40 160 L48 170 L85 125" className="astral-body-part" />
      <path d="M125 115 L160 160 L152 170 L115 125" className="astral-body-part" />
      
      {/* Hands */}
      <circle cx="40" cy="168" r="8" className="astral-body-part" />
      <circle cx="160" cy="168" r="8" className="astral-body-part" />
      
      {/* Legs */}
      <path d="M85 200 L65 280 L85 285 L95 205" className="astral-body-part" />
      <path d="M115 200 L135 280 L115 285 L105 205" className="astral-body-part" />
      
      {/* Feet */}
      <path d="M65 280 L55 285 L65 295 L85 285" className="astral-body-part" />
      <path d="M135 280 L145 285 L135 295 L115 285" className="astral-body-part" />
    </>
  );
};

export default HumanSilhouette;
