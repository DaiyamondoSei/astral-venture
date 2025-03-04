
import React from 'react';

interface InfinityEssenceProps {
  showInfinity: boolean;
}

const InfinityEssence: React.FC<InfinityEssenceProps> = ({ showInfinity }) => {
  if (!showInfinity) return null;
  
  return (
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
  );
};

export default InfinityEssence;
