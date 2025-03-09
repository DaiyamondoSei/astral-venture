
import React from 'react';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { cn } from '@/lib/utils';
import MetatronsCube, { CubeSize } from './metatrons-cube/MetatronsCube';

interface VisualSystemProps {
  className?: string;
}

const VisualSystem: React.FC<VisualSystemProps> = ({ className }) => {
  const { features } = usePerfConfig();
  
  // Define node positions for a simple sacred geometry pattern
  const nodes = [
    { id: '1', x: 0, y: 0, pulsing: true },
    { id: '2', x: 50, y: 0 },
    { id: '3', x: 25, y: 43.3 },
    { id: '4', x: -25, y: 43.3 },
    { id: '5', x: -50, y: 0 },
    { id: '6', x: -25, y: -43.3 },
    { id: '7', x: 25, y: -43.3 },
  ];
  
  // Define connections between nodes
  const connections = [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '1', target: '5' },
    { source: '1', target: '6' },
    { source: '1', target: '7' },
    { source: '2', target: '3' },
    { source: '3', target: '4' },
    { source: '4', target: '5' },
    { source: '5', target: '6' },
    { source: '6', target: '7' },
    { source: '7', target: '2' },
  ];
  
  // Dynamically adjust visual components based on performance settings
  const renderFloatingParticles = features.enableParticles;
  const enableComplexAnimations = features.enableComplexAnimations;
  const cubeSize: CubeSize = 'md';
  
  return (
    <div className={cn("relative", className)}>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 to-transparent opacity-50" />
      
      {/* Sacred geometry visualization */}
      <MetatronsCube
        nodes={nodes}
        connections={connections}
        variant="ethereal"
        size={cubeSize}
        withAnimation={enableComplexAnimations}
      />
      
      {/* Floating particles (only render if performance allows) */}
      {renderFloatingParticles && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-purple-500/30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 20 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
                animationIterationCount: 'infinite',
                animation: 'float linear'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VisualSystem;
