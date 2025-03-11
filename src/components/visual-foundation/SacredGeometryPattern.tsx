
/**
 * SacredGeometryPattern Component
 * 
 * Renders various sacred geometry patterns with adaptive quality based on device capabilities.
 */
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import * as geometryUtils from '@/utils/geometryUtils';

export type PatternType = 
  | 'flower-of-life'
  | 'seed-of-life'
  | 'metatrons-cube'
  | 'sri-yantra'
  | 'vesica-piscis'
  | 'fibonacci-spiral';

interface SacredGeometryPatternProps {
  className?: string;
  pattern: PatternType;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  animated?: boolean;
  interactive?: boolean;
}

/**
 * SacredGeometryPattern renders various sacred geometry patterns
 */
const SacredGeometryPattern: React.FC<SacredGeometryPatternProps> = ({
  className,
  pattern,
  size = 300,
  color = 'currentColor',
  strokeWidth = 1,
  fill = 'none',
  animated = true,
  interactive = false
}) => {
  const { effectiveQualityLevel, config } = usePerfConfig();
  
  // Determine pattern detail level based on quality
  const detailLevel = useMemo(() => {
    switch (effectiveQualityLevel) {
      case 1: return 1;
      case 2: return 2;
      case 3: return 3;
      case 4: return 4;
      case 5:
      default: return 5;
    }
  }, [effectiveQualityLevel]);
  
  // Generate pattern based on type
  const patternElements = useMemo(() => {
    const radius = size / 3;
    const centerX = size / 2;
    const centerY = size / 2;
    
    switch (pattern) {
      case 'flower-of-life': {
        const { circles } = geometryUtils.generateFlowerOfLife(
          Math.min(3, detailLevel),
          radius / 2,
          centerX,
          centerY
        );
        
        return (
          <>
            {circles.map((circle, index) => (
              <circle
                key={`circle-${index}`}
                cx={circle.x}
                cy={circle.y}
                r={circle.r}
                stroke={color}
                strokeWidth={strokeWidth}
                fill={fill}
                className={animated ? "transition-all duration-300" : ""}
              />
            ))}
          </>
        );
      }
      
      case 'seed-of-life': {
        const { circles } = geometryUtils.generateSeedOfLife(
          radius / 1.8,
          centerX,
          centerY
        );
        
        return (
          <>
            {circles.map((circle, index) => (
              <circle
                key={`circle-${index}`}
                cx={circle.x}
                cy={circle.y}
                r={circle.r}
                stroke={color}
                strokeWidth={strokeWidth}
                fill={fill}
                className={animated ? "transition-all duration-300" : ""}
              />
            ))}
          </>
        );
      }
      
      case 'metatrons-cube': {
        const { nodes, connections } = geometryUtils.generateMetatronsCube(
          radius / 2,
          detailLevel,
          centerX,
          centerY
        );
        
        return (
          <>
            {connections.map((connection, index) => {
              const source = nodes.find(n => n.id === connection.from);
              const target = nodes.find(n => n.id === connection.to);
              
              if (!source || !target) return null;
              
              return (
                <line
                  key={`line-${index}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={color}
                  strokeWidth={strokeWidth * 0.8}
                  className={animated ? "transition-all duration-500" : ""}
                />
              );
            })}
            
            {nodes.map((node, index) => (
              <circle
                key={`node-${index}`}
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={color}
                className={animated ? "transition-all duration-300" : ""}
              />
            ))}
          </>
        );
      }
      
      case 'sri-yantra': {
        const { triangles, circles, bindu } = geometryUtils.generateSriYantra(
          radius * 1.5,
          centerX,
          centerY
        );
        
        return (
          <>
            {/* Draw circles */}
            {circles.map((circle, index) => (
              <circle
                key={`circle-${index}`}
                cx={circle.x}
                cy={circle.y}
                r={circle.r}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                className={animated ? "transition-all duration-300" : ""}
              />
            ))}
            
            {/* Draw triangles */}
            {triangles.map((triangle, index) => (
              <polygon
                key={`triangle-${index}`}
                points={triangle.points.map(p => `${p.x},${p.y}`).join(' ')}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                className={animated ? "transition-all duration-300" : ""}
              />
            ))}
            
            {/* Draw bindu (center point) */}
            <circle
              cx={bindu.x}
              cy={bindu.y}
              r={bindu.r}
              fill={color}
              className={animated ? "transition-all duration-300" : ""}
            />
          </>
        );
      }
      
      case 'vesica-piscis': {
        const { circles, intersectionPoints } = geometryUtils.generateVesicaPiscis(
          radius,
          0.5,
          centerX,
          centerY
        );
        
        return (
          <>
            {/* Draw circles */}
            {circles.map((circle, index) => (
              <circle
                key={`circle-${index}`}
                cx={circle.x}
                cy={circle.y}
                r={circle.r}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                className={animated ? "transition-all duration-300" : ""}
              />
            ))}
            
            {/* Draw intersection points */}
            {intersectionPoints.map((point, index) => (
              <circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={color}
                className={animated ? "transition-all duration-300" : ""}
              />
            ))}
          </>
        );
      }
      
      case 'fibonacci-spiral': {
        const pointsCount = 25 * detailLevel;
        const spiralPoints = geometryUtils.generateFibonacciSpiral(
          detailLevel,
          pointsCount,
          radius / 25,
          centerX,
          centerY
        );
        
        // Create a path from the points
        let pathData = `M ${spiralPoints[0].x} ${spiralPoints[0].y}`;
        for (let i = 1; i < spiralPoints.length; i++) {
          pathData += ` L ${spiralPoints[i].x} ${spiralPoints[i].y}`;
        }
        
        return (
          <>
            <path
              d={pathData}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              className={animated ? "transition-all duration-300" : ""}
            />
            
            {/* Draw golden rectangles if detail level is high enough */}
            {detailLevel >= 3 && (
              <>
                {[1, 2, 3, 5, 8, 13, 21].map((size, index) => {
                  const normSize = size * radius / 40;
                  return (
                    <rect
                      key={`rect-${index}`}
                      x={centerX}
                      y={centerY}
                      width={normSize}
                      height={normSize * geometryUtils.PHI}
                      stroke={color}
                      strokeWidth={strokeWidth * 0.5}
                      fill="none"
                      opacity={0.5}
                      className={animated ? "transition-all duration-300" : ""}
                    />
                  );
                })}
              </>
            )}
          </>
        );
      }
      
      default:
        return null;
    }
  }, [pattern, size, color, strokeWidth, fill, animated, detailLevel]);
  
  // Apply animations based on configuration and props
  const animationClasses = useMemo(() => {
    if (!animated || config.disableAnimations) return "";
    
    return interactive 
      ? "transform transition-transform duration-1000 hover:scale-105"
      : "animate-[pulse_8s_ease-in-out_infinite]";
  }, [animated, interactive, config.disableAnimations]);
  
  return (
    <div className={cn("relative", className)}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className={cn("transition-opacity duration-500", animationClasses)}
      >
        {/* Add filters for glow effects if enabled and quality level permits */}
        {detailLevel >= 3 && (
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        )}
        
        {/* Render the pattern elements */}
        <g filter={detailLevel >= 3 ? "url(#glow)" : ""}>
          {patternElements}
        </g>
      </svg>
    </div>
  );
};

export default SacredGeometryPattern;
