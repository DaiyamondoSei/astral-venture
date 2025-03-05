
import React from 'react';

interface ConsciousStateLabelProps {
  visualizationVariant: string;
}

const ConsciousStateLabel: React.FC<ConsciousStateLabelProps> = ({ visualizationVariant }) => {
  return (
    <span className={`px-2 py-0.5 rounded-full ${
      visualizationVariant === "transcendent" ? "bg-indigo-500/30 text-indigo-200" :
      visualizationVariant === "awakened" ? "bg-violet-500/30 text-violet-200" :
      visualizationVariant === "illuminated" ? "bg-blue-500/30 text-blue-200" :
      visualizationVariant === "aware" ? "bg-cyan-500/30 text-cyan-200" :
      "bg-white/10 text-white/60"
    }`}>
      {visualizationVariant.charAt(0).toUpperCase() + visualizationVariant.slice(1)} State
    </span>
  );
};

export default ConsciousStateLabel;
