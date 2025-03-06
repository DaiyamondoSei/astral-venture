
import React from 'react';

const MetatronsBackground: React.FC = () => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
    >
      {/* Center circle */}
      <circle cx="250" cy="250" r="20" fill="none" stroke="rgba(255,255,255,0.5)" />
      
      {/* Inner circles */}
      <g fill="none" stroke="rgba(255,255,255,0.3)">
        <circle cx="250" cy="180" r="20" />
        <circle cx="320" cy="215" r="20" />
        <circle cx="320" cy="285" r="20" />
        <circle cx="250" cy="320" r="20" />
        <circle cx="180" cy="285" r="20" />
        <circle cx="180" cy="215" r="20" />
      </g>
      
      {/* Outer circles */}
      <g fill="none" stroke="rgba(255,255,255,0.2)">
        <circle cx="250" cy="110" r="20" />
        <circle cx="390" cy="180" r="20" />
        <circle cx="390" cy="320" r="20" />
        <circle cx="250" cy="390" r="20" />
        <circle cx="110" cy="320" r="20" />
        <circle cx="110" cy="180" r="20" />
      </g>
      
      {/* Connecting lines */}
      <g stroke="rgba(255,255,255,0.15)">
        {/* Inner hexagon */}
        <line x1="250" y1="180" x2="320" y2="215" />
        <line x1="320" y1="215" x2="320" y2="285" />
        <line x1="320" y1="285" x2="250" y2="320" />
        <line x1="250" y1="320" x2="180" y2="285" />
        <line x1="180" y1="285" x2="180" y2="215" />
        <line x1="180" y1="215" x2="250" y2="180" />
        
        {/* Outer hexagon */}
        <line x1="250" y1="110" x2="390" y2="180" />
        <line x1="390" y1="180" x2="390" y2="320" />
        <line x1="390" y1="320" x2="250" y2="390" />
        <line x1="250" y1="390" x2="110" y2="320" />
        <line x1="110" y1="320" x2="110" y2="180" />
        <line x1="110" y1="180" x2="250" y2="110" />
        
        {/* Connecting spokes */}
        <line x1="250" y1="250" x2="250" y2="110" />
        <line x1="250" y1="250" x2="390" y2="180" />
        <line x1="250" y1="250" x2="390" y2="320" />
        <line x1="250" y1="250" x2="250" y2="390" />
        <line x1="250" y1="250" x2="110" y2="320" />
        <line x1="250" y1="250" x2="110" y2="180" />
        
        {/* Inner connections */}
        <line x1="250" y1="250" x2="250" y2="180" />
        <line x1="250" y1="250" x2="320" y2="215" />
        <line x1="250" y1="250" x2="320" y2="285" />
        <line x1="250" y1="250" x2="250" y2="320" />
        <line x1="250" y1="250" x2="180" y2="285" />
        <line x1="250" y1="250" x2="180" y2="215" />
      </g>
    </svg>
  );
};

export default MetatronsBackground;
