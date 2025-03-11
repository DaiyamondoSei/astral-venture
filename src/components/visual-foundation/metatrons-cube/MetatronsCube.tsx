
/**
 * MetatronsCube Component
 * 
 * A sacred geometry visualization component that renders Metatron's Cube
 * with various complexity levels and interactive features.
 */
import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MetatronsNode, MetatronsConnection, CubeSize, CubeTheme } from './types';
import { getGeometryDetail, shouldEnableFeature } from '@/utils/performanceUtils';

interface MetatronsCubeProps {
  nodes: MetatronsNode[];
  connections: MetatronsConnection[];
  variant?: CubeTheme;
  size?: CubeSize;
  className?: string;
  activeNodeId?: string;
  qualityLevel?: number;
  withAnimation?: boolean;
  intensity?: number;
  onNodeClick?: (nodeId: string) => void;
}

/**
 * MetatronsCube component for sacred geometry visualization
 */
const MetatronsCube: React.FC<MetatronsCubeProps> = ({
  nodes,
  connections,
  variant = 'default',
  size = 'md',
  className,
  activeNodeId,
  qualityLevel = 3,
  withAnimation = true,
  intensity = 1,
  onNodeClick
}) => {
  // Get geometry detail level based on quality setting
  const geometryDetail = useMemo(() => 
    getGeometryDetail(qualityLevel), [qualityLevel]);
  
  // Determine if glow effect should be enabled
  const enableGlow = useMemo(() => 
    shouldEnableFeature('glow', qualityLevel), [qualityLevel]);
  
  // Set size-based dimensions
  const dimensions = useMemo(() => {
    switch (size) {
      case 'xs': return { width: 200, height: 200, nodeScale: 0.7 };
      case 'sm': return { width: 300, height: 300, nodeScale: 0.85 };
      case 'md': return { width: 400, height: 400, nodeScale: 1.0 };
      case 'lg': return { width: 500, height: 500, nodeScale: 1.15 };
      case 'xl': return { width: 600, height: 600, nodeScale: 1.3 };
      default: return { width: 400, height: 400, nodeScale: 1.0 };
    }
  }, [size]);
  
  // Set theme-based styles
  const themeStyles = useMemo(() => {
    switch (variant) {
      case 'cosmic':
        return {
          bgClassName: 'bg-black',
          nodeColors: {
            default: '#60A5FA',
            active: '#8B5CF6',
            pulse: '#EC4899'
          },
          connectionColors: {
            default: 'rgba(96, 165, 250, 0.3)',
            active: 'rgba(139, 92, 246, 0.6)'
          },
          glowColor: '#8B5CF6'
        };
      case 'chakra':
        return {
          bgClassName: 'bg-indigo-950',
          nodeColors: {
            default: '#FCD34D',
            active: '#F97316',
            pulse: '#EC4899'
          },
          connectionColors: {
            default: 'rgba(252, 211, 77, 0.3)',
            active: 'rgba(249, 115, 22, 0.6)'
          },
          glowColor: '#F97316'
        };
      case 'energy':
        return {
          bgClassName: 'bg-emerald-950',
          nodeColors: {
            default: '#10B981',
            active: '#34D399',
            pulse: '#6EE7B7'
          },
          connectionColors: {
            default: 'rgba(16, 185, 129, 0.3)',
            active: 'rgba(52, 211, 153, 0.6)'
          },
          glowColor: '#34D399'
        };
      case 'spiritual':
        return {
          bgClassName: 'bg-violet-950',
          nodeColors: {
            default: '#C4B5FD',
            active: '#A78BFA',
            pulse: '#8B5CF6'
          },
          connectionColors: {
            default: 'rgba(196, 181, 253, 0.3)',
            active: 'rgba(167, 139, 250, 0.6)'
          },
          glowColor: '#A78BFA'
        };
      case 'quantum':
        return {
          bgClassName: 'bg-cyan-950',
          nodeColors: {
            default: '#0EA5E9',
            active: '#38BDF8',
            pulse: '#7DD3FC'
          },
          connectionColors: {
            default: 'rgba(14, 165, 233, 0.3)',
            active: 'rgba(56, 189, 248, 0.6)'
          },
          glowColor: '#38BDF8'
        };
      default:
        return {
          bgClassName: 'bg-slate-900',
          nodeColors: {
            default: '#94A3B8',
            active: '#CBD5E1',
            pulse: '#F1F5F9'
          },
          connectionColors: {
            default: 'rgba(148, 163, 184, 0.3)',
            active: 'rgba(203, 213, 225, 0.6)'
          },
          glowColor: '#CBD5E1'
        };
    }
  }, [variant]);
  
  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => {
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  }, [onNodeClick]);
  
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-lg overflow-hidden transition-all",
        themeStyles.bgClassName,
        className
      )}
      style={{
        width: dimensions.width,
        height: dimensions.height
      }}
    >
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        viewBox={`0 0 400 400`}
        className="absolute inset-0"
      >
        {/* Define filters for glow effects if enabled */}
        {enableGlow && (
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={2 * intensity} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={4 * intensity} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={6 * intensity} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        )}
        
        {/* Draw connections between nodes */}
        {connections.map((connection, index) => {
          // Find source and target nodes
          const sourceNode = nodes.find(node => node.id === connection.from);
          const targetNode = nodes.find(node => node.id === connection.to);
          
          if (!sourceNode || !targetNode) return null;
          
          const isActive = connection.active || 
                          sourceNode.id === activeNodeId || 
                          targetNode.id === activeNodeId;
                          
          const animationClass = withAnimation && isActive && connection.animated 
            ? "animate-pulse" 
            : "";
          
          return (
            <line
              key={`connection-${index}`}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke={isActive ? themeStyles.connectionColors.active : themeStyles.connectionColors.default}
              strokeWidth={connection.width || (isActive ? 1.5 : 1)}
              className={animationClass}
            />
          );
        })}
        
        {/* Draw nodes */}
        {nodes.map((node) => {
          const isActive = node.active || node.id === activeNodeId;
          const isPulsing = node.pulsing || (isActive && withAnimation);
          
          // Scale node size based on the size prop
          const nodeSize = node.size * dimensions.nodeScale;
          
          // Determine filter based on node state
          const filterEffect = enableGlow 
            ? (isPulsing ? "url(#pulseGlow)" : (isActive ? "url(#activeGlow)" : "url(#glow)"))
            : "";
          
          // Animation class for pulsing effect if animation is enabled
          const animationClass = withAnimation && isPulsing 
            ? "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" 
            : "";
            
          // Determine node color based on state
          let nodeColor = themeStyles.nodeColors.default;
          if (isPulsing) nodeColor = themeStyles.nodeColors.pulse;
          else if (isActive) nodeColor = themeStyles.nodeColors.active;
          
          return (
            <g key={`node-${node.id}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeSize}
                fill={nodeColor}
                filter={filterEffect}
                className={cn(
                  "transition-all cursor-pointer",
                  animationClass
                )}
                onClick={() => handleNodeClick(node.id)}
              />
              
              {/* Add label if present */}
              {node.label && (
                <text
                  x={node.x}
                  y={node.y + nodeSize + 15}
                  textAnchor="middle"
                  fill={isActive ? nodeColor : "rgba(255,255,255,0.7)"}
                  fontSize={12}
                  className="pointer-events-none"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MetatronsCube;
