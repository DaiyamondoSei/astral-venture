
import React from 'react';

const SacredGeometryBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-quantum-500/30 rounded-full"></div>
      <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border border-quantum-400/30 rounded-full"></div>
      <div className="absolute top-[40%] left-[40%] w-1/5 h-1/5 border border-quantum-300/30 rounded-full"></div>
      
      {/* Sacred triangles */}
      <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,10 10,90 90,90" fill="none" stroke="rgba(120, 80, 255, 0.1)" strokeWidth="0.2" />
        <polygon points="50,15 15,85 85,85" fill="none" stroke="rgba(120, 80, 255, 0.1)" strokeWidth="0.2" />
        <polygon points="50,20 20,80 80,80" fill="none" stroke="rgba(120, 80, 255, 0.1)" strokeWidth="0.2" />
      </svg>
      
      {/* Metatron's cube hint */}
      <svg className="absolute top-[10%] right-[10%] w-1/4 h-1/4 opacity-10" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(180, 120, 255, 0.3)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(180, 120, 255, 0.3)" strokeWidth="0.5" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(180, 120, 255, 0.2)" strokeWidth="0.3" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(180, 120, 255, 0.2)" strokeWidth="0.3" />
        <line x1="15" y1="15" x2="85" y2="85" stroke="rgba(180, 120, 255, 0.2)" strokeWidth="0.3" />
        <line x1="15" y1="85" x2="85" y2="15" stroke="rgba(180, 120, 255, 0.2)" strokeWidth="0.3" />
      </svg>
    </div>
  );
};

export default SacredGeometryBackground;
