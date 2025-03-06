
import React from 'react';

type GeometryIconType = 'metatron' | 'flower-of-life' | 'seed-of-life' | 'tree-of-life' | 
  'vesica-piscis' | 'sri-yantra' | 'merkaba' | 'torus' | 'golden-spiral' | 
  'pentagram' | 'hexagram' | 'octagram' | 'infinity' | 'platonic-solid';

interface SacredGeometryIconProps {
  type: GeometryIconType;
  size?: number;
  color?: string;
  secondaryColor?: string;
  className?: string;
  animated?: boolean;
}

/**
 * Collection of sacred geometry icons represented as SVG components
 */
export const SacredGeometryIcon: React.FC<SacredGeometryIconProps> = ({
  type,
  size = 24,
  color = "currentColor",
  secondaryColor = "rgba(255,255,255,0.3)",
  className = "",
  animated = false
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'metatron':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <circle cx="50" cy="50" r="20" />
              <circle cx="50" cy="20" r="8" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="50" cy="80" r="8" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="20" cy="50" r="8" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="80" cy="50" r="8" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="29.3" cy="29.3" r="8" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="70.7" cy="29.3" r="8" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="29.3" cy="70.7" r="8" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="70.7" cy="70.7" r="8" className={animated ? "animate-pulse-slow" : ""} />
              <path d="M50,20 L29.3,29.3 L20,50 L29.3,70.7 L50,80 L70.7,70.7 L80,50 L70.7,29.3 Z" stroke={secondaryColor} />
              <path d="M29.3,29.3 L70.7,70.7 M70.7,29.3 L29.3,70.7 M50,20 L50,80 M20,50 L80,50" stroke={secondaryColor} />
            </g>
          </svg>
        );
        
      case 'flower-of-life':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <circle cx="50" cy="50" r="15" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="65" cy="50" r="15" />
              <circle cx="57.5" cy="37.5" r="15" />
              <circle cx="42.5" cy="37.5" r="15" />
              <circle cx="35" cy="50" r="15" />
              <circle cx="42.5" cy="62.5" r="15" />
              <circle cx="57.5" cy="62.5" r="15" />
            </g>
          </svg>
        );
        
      case 'seed-of-life':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <circle cx="50" cy="50" r="20" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="50" cy="30" r="10" />
              <circle cx="67.3" cy="40" r="10" />
              <circle cx="67.3" cy="60" r="10" />
              <circle cx="50" cy="70" r="10" />
              <circle cx="32.7" cy="60" r="10" />
              <circle cx="32.7" cy="40" r="10" />
            </g>
          </svg>
        );
        
      case 'sri-yantra':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <circle cx="50" cy="50" r="25" />
              <path d="M50,25 L20,60 L80,60 Z" />
              <path d="M20,40 L80,40 L50,75 Z" />
              <path d="M37.5,32.5 L62.5,32.5 L75,60 L25,60 Z" className={animated ? "animate-pulse-slow" : ""} />
              <path d="M30,40 L70,40 L60,65 L40,65 Z" />
              <circle cx="50" cy="50" r="5" fill={color} />
            </g>
          </svg>
        );
        
      case 'merkaba':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <path d="M50,20 L20,65 L80,65 Z" className={animated ? "animate-pulse-slow" : ""} />
              <path d="M50,80 L20,35 L80,35 Z" className={animated ? "animate-pulse-slow" : ""} />
              <path d="M50,20 L20,65 M50,20 L80,65 M20,65 L80,65" />
              <path d="M50,80 L20,35 M50,80 L80,35 M20,35 L80,35" />
              <path d="M50,20 L50,80 M20,35 L20,65 M80,35 L80,65" stroke={secondaryColor} />
            </g>
          </svg>
        );
        
      case 'torus':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <ellipse cx="50" cy="50" rx="30" ry="10" />
              <ellipse cx="50" cy="50" rx="10" ry="30" />
              <ellipse cx="50" cy="50" rx="25" ry="15" className={animated ? "animate-pulse-slow" : ""} />
              <ellipse cx="50" cy="50" rx="15" ry="25" className={animated ? "animate-pulse-slow" : ""} />
            </g>
          </svg>
        );
        
      case 'golden-spiral':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <path d="M90,50 C90,30 70,10 50,10 C30,10 10,30 10,50 C10,70 30,90 50,90 C60,90 70,80 70,70 C70,60 60,50 50,50 C40,50 35,55 35,60 C35,65 40,70 45,70 C48,70 50,68 50,65 C50,62 48,60 45,60" 
                className={animated ? "animate-draw" : ""} />
              <circle cx="50" cy="50" r="40" stroke={secondaryColor} />
            </g>
          </svg>
        );
        
      case 'pentagram':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <path d="M50,15 L61,42 L90,42 L67,60 L75,85 L50,70 L25,85 L33,60 L10,42 L39,42 Z" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="50" cy="50" r="35" stroke={secondaryColor} />
            </g>
          </svg>
        );
        
      case 'hexagram':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <path d="M50,15 L80,70 L20,70 Z" className={animated ? "animate-pulse-slow" : ""} />
              <path d="M50,85 L20,30 L80,30 Z" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="50" cy="50" r="35" stroke={secondaryColor} />
            </g>
          </svg>
        );
        
      case 'octagram':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <path d="M50,10 L60,50 L90,50 L60,70 L70,90 L50,75 L30,90 L40,70 L10,50 L40,50 Z" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="50" cy="50" r="40" stroke={secondaryColor} />
            </g>
          </svg>
        );
        
      case 'infinity':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <path d="M30,50 C30,40 40,30 50,30 C60,30 70,40 70,50 C70,60 60,70 50,70 C40,70 30,60 30,50 Z" className={animated ? "animate-pulse-slow" : ""} />
              <path d="M15,50 C15,35 30,20 50,20 C70,20 85,35 85,50 C85,65 70,80 50,80 C30,80 15,65 15,50 Z" stroke={secondaryColor} />
            </g>
          </svg>
        );
        
      case 'platonic-solid':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <path d="M50,20 L30,70 L70,70 Z" className={animated ? "animate-pulse-slow" : ""} />
              <path d="M30,70 L50,50 L70,70" />
              <path d="M50,20 L50,50" />
              <path d="M30,40 L70,40 L50,70 Z" stroke={secondaryColor} />
            </g>
          </svg>
        );
        
      case 'tree-of-life':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <circle cx="50" cy="20" r="8" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="30" cy="35" r="8" />
              <circle cx="70" cy="35" r="8" />
              <circle cx="50" cy="50" r="8" className={animated ? "animate-pulse-slow" : ""} />
              <circle cx="30" cy="65" r="8" />
              <circle cx="70" cy="65" r="8" />
              <circle cx="50" cy="80" r="8" />
              <path d="M50,20 L30,35 L50,50 L70,35 L50,20 M30,35 L30,65 L50,80 L70,65 L70,35 M30,65 L50,50 L70,65" stroke={secondaryColor} />
            </g>
          </svg>
        );
        
      case 'vesica-piscis':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <circle cx="40" cy="50" r="25" />
              <circle cx="60" cy="50" r="25" className={animated ? "animate-pulse-slow" : ""} />
              <path d="M40,25 L60,25 M40,75 L60,75" stroke={secondaryColor} />
            </g>
          </svg>
        );
        
      default:
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            width={size} 
            height={size} 
            className={className}
          >
            <g stroke={color} fill="none" strokeWidth="1.5">
              <circle cx="50" cy="50" r="40" />
              <circle cx="50" cy="50" r="20" className={animated ? "animate-pulse-slow" : ""} />
              <path d="M10,50 L90,50 M50,10 L50,90" />
            </g>
          </svg>
        );
    }
  };

  return renderIcon();
};
