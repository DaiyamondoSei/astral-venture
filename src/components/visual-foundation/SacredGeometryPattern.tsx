
/**
 * Sacred Geometry Pattern Component
 * 
 * Renders various sacred geometry patterns with adaptive quality based on device capability.
 */
import React, { useMemo } from 'react';
import { usePerformance } from '../../contexts/PerformanceContext';
import { 
  generateMetatronsCube, 
  generateFlowerOfLife,
  GeometryPattern
} from '../../utils/geometry/geometryUtils';

export type GeometryPatternType = 
  | 'metatronsCube' 
  | 'flowerOfLife' 
  | 'seedOfLife' 
  | 'treeOfLife' 
  | 'sriYantra';

export type PatternTheme = 
  | 'default' 
  | 'cosmic' 
  | 'chakra' 
  | 'energy' 
  | 'spiritual' 
  | 'quantum';

interface SacredGeometryPatternProps {
  type?: GeometryPatternType;
  size?: number;
  theme?: PatternTheme;
  detail?: number;
  animate?: boolean;
  interactive?: boolean;
  showLabels?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SacredGeometryPattern: React.FC<SacredGeometryPatternProps> = ({
  type = 'metatronsCube',
  size = 300,
  theme = 'default',
  detail: userDetail,
  animate = true,
  interactive = true,
  showLabels = false,
  className = '',
  style = {}
}) => {
  const { qualityLevel, isLowPerformance } = usePerformance();
  
  // Calculate detail level based on quality level
  const detailLevel = useMemo(() => {
    if (userDetail !== undefined) return userDetail;
    
    // Map quality levels to detail levels
    const detailMap = {
      1: 1, // Low
      2: 2, // Medium
      3: 3, // High
      4: 4, // Ultra
      5: 5  // Extreme
    };
    
    return detailMap[qualityLevel] || 3;
  }, [qualityLevel, userDetail]);
  
  // Generate the geometry pattern
  const geometryData = useMemo((): GeometryPattern => {
    const radius = size * 0.4;
    const centerX = size / 2;
    const centerY = size / 2;
    
    switch (type) {
      case 'metatronsCube':
        return generateMetatronsCube(radius, detailLevel, centerX, centerY);
      case 'flowerOfLife':
        return generateFlowerOfLife(radius, detailLevel, centerX, centerY);
      // Add more pattern types as needed
      default:
        return generateMetatronsCube(radius, detailLevel, centerX, centerY);
    }
  }, [type, size, detailLevel]);
  
  // Calculate colors based on theme
  const colors = useMemo(() => {
    switch (theme) {
      case 'cosmic':
        return {
          background: '#0a0728',
          primary: '#5d4dff',
          secondary: '#a991ff',
          tertiary: '#ff49e2',
          nodes: '#ffffff',
          glow: 'rgba(93, 77, 255, 0.8)'
        };
      case 'chakra':
        return {
          background: '#1a1a2e',
          primary: '#e94560',
          secondary: '#ffbd69',
          tertiary: '#36eee0',
          nodes: '#ffffff',
          glow: 'rgba(233, 69, 96, 0.8)'
        };
      case 'energy':
        return {
          background: '#10002b',
          primary: '#7b2cbf',
          secondary: '#c77dff',
          tertiary: '#e0aaff',
          nodes: '#ffffff',
          glow: 'rgba(123, 44, 191, 0.8)'
        };
      case 'spiritual':
        return {
          background: '#03071e',
          primary: '#ffba08',
          secondary: '#faa307',
          tertiary: '#f48c06',
          nodes: '#ffffff',
          glow: 'rgba(255, 186, 8, 0.8)'
        };
      case 'quantum':
        return {
          background: '#000814',
          primary: '#48cae4',
          secondary: '#90e0ef',
          tertiary: '#ade8f4',
          nodes: '#ffffff',
          glow: 'rgba(72, 202, 228, 0.8)'
        };
      case 'default':
      default:
        return {
          background: '#0a0a0a',
          primary: '#4cc9f0',
          secondary: '#4895ef',
          tertiary: '#4361ee',
          nodes: '#ffffff',
          glow: 'rgba(76, 201, 240, 0.8)'
        };
    }
  }, [theme]);
  
  // Calculate animation settings based on performance
  const animations = useMemo(() => {
    if (!animate) return { enabled: false };
    
    return {
      enabled: true,
      duration: isLowPerformance ? '3s' : '2s',
      nodeAnimation: isLowPerformance ? 'none' : 'pulse 3s infinite alternate',
      lineAnimation: isLowPerformance ? 'none' : 'glow 2s infinite alternate',
      animationCount: isLowPerformance ? 3 : geometryData.nodes.length
    };
  }, [animate, isLowPerformance, geometryData.nodes.length]);
  
  // Render pattern
  return (
    <div 
      className={`sacred-geometry-pattern ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        background: colors.background,
        borderRadius: '50%',
        overflow: 'hidden',
        ...style
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Render connections */}
        {geometryData.connections.map((connection, index) => {
          // Find connected nodes
          const fromNode = geometryData.nodes.find(n => n.id === connection.from);
          const toNode = geometryData.nodes.find(n => n.id === connection.to);
          
          if (!fromNode || !toNode) return null;
          
          // Determine line color based on connection type
          let color = colors.primary;
          let width = 1;
          let opacity = 0.6;
          
          if (connection.type === 'secondary') {
            color = colors.secondary;
            width = 0.8;
            opacity = 0.5;
          } else if (connection.type === 'tertiary') {
            color = colors.tertiary;
            width = 0.6;
            opacity = 0.4;
          } else if (connection.type === 'energy') {
            color = colors.tertiary;
            width = 0.5;
            opacity = 0.3;
          } else if (connection.type === 'resonance') {
            color = colors.secondary;
            width = 0.4;
            opacity = 0.2;
          }
          
          // Apply connection width if specified
          if (connection.width) {
            width = connection.width;
          }
          
          // Skip inactive connections if not all should be shown
          if (!connection.active && detailLevel < 4) return null;
          
          return (
            <line
              key={`connection-${index}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={color}
              strokeWidth={width}
              opacity={opacity}
              style={{
                animation: animations.enabled && index % 3 === 0 
                  ? animations.lineAnimation 
                  : 'none'
              }}
            />
          );
        })}
        
        {/* Render nodes */}
        {geometryData.nodes.map((node, index) => {
          // Skip rendering some nodes in low detail mode
          if (!node.active && detailLevel < 3) return null;
          
          // Determine node size
          const nodeSize = node.size || 3;
          
          // Calculate node opacity and color
          let opacity = 0.8;
          let fill = colors.nodes;
          
          if (node.energy) {
            opacity = 0.5 + (node.energy * 0.5);
          }
          
          return (
            <circle
              key={`node-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={nodeSize}
              fill={fill}
              opacity={opacity}
              style={{
                animation: animations.enabled && index < animations.animationCount
                  ? animations.nodeAnimation
                  : 'none',
                filter: `drop-shadow(0 0 ${nodeSize / 2}px ${colors.glow})`
              }}
            />
          );
        })}
        
        {/* Render labels if enabled */}
        {showLabels && geometryData.nodes.map((node) => {
          if (!node.active || !node.id.includes('hex')) return null;
          
          return (
            <text
              key={`label-${node.id}`}
              x={node.x}
              y={node.y + 15}
              textAnchor="middle"
              fill={colors.nodes}
              fontSize="10"
              opacity={0.8}
            >
              {node.id}
            </text>
          );
        })}
      </svg>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.4; r: ${isLowPerformance ? '2' : '2'}; }
          100% { opacity: 0.9; r: ${isLowPerformance ? '3' : '4'}; }
        }
        
        @keyframes glow {
          0% { stroke-opacity: 0.3; }
          100% { stroke-opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default SacredGeometryPattern;
