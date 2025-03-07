import { useEffect, useRef, useState } from 'react';
import { Vector2 } from 'three';
import { Particle } from './types';

interface ParticleSystemOptions {
  count: number;
  speed?: number;
  size?: number;
  color?: string;
  interactive?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const useParticleSystem = ({
  count,
  speed = 0.5,
  size = 3,
  color = '#ffffff',
  interactive = false,
  containerRef
}: ParticleSystemOptions) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState<Vector2 | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Initialize particles
  useEffect(() => {
    if (!containerRef?.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
    
    // Create initial particles
    const initialParticles: Particle[] = Array.from({ length: count }).map(() => ({
      position: new Vector2(
        Math.random() * rect.width,
        Math.random() * rect.height
      ),
      velocity: new Vector2(
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed
      ),
      size: Math.random() * size + 1,
      color: color,
      alpha: Math.random() * 0.5 + 0.5,
      connections: []
    }));
    
    setParticles(initialParticles);
    
    // Handle window resize
    const handleResize = () => {
      const newRect = container.getBoundingClientRect();
      setDimensions({ width: newRect.width, height: newRect.height });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [containerRef, count, speed, size, color]);
  
  // Handle mouse interaction
  useEffect(() => {
    if (!interactive || !containerRef?.current) return;
    
    const container = containerRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition(new Vector2(x, y));
    };
    
    const handleMouseLeave = () => {
      setMousePosition(null);
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive, containerRef]);
  
  // Animation loop
  useEffect(() => {
    if (!containerRef?.current || particles.length === 0) return;
    
    const animate = (timestamp: number) => {
      // Limit updates to 60fps for performance
      if (timestamp - lastUpdateTimeRef.current < 16) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastUpdateTimeRef.current = timestamp;
      
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          // Update position
          particle.position.add(particle.velocity);
          
          // Boundary check
          if (particle.position.x < 0 || particle.position.x > dimensions.width) {
            particle.velocity.x = -particle.velocity.x;
          }
          
          if (particle.position.y < 0 || particle.position.y > dimensions.height) {
            particle.velocity.y = -particle.velocity.y;
          }
          
          // Mouse interaction
          if (mousePosition) {
            const distance = particle.position.distanceTo(mousePosition);
            const maxDistance = 100;
            
            if (distance < maxDistance) {
              const force = (1 - distance / maxDistance) * 0.02;
              const direction = new Vector2()
                .subVectors(particle.position, mousePosition)
                .normalize();
              
              particle.velocity.add(direction.multiplyScalar(force));
              
              // Limit velocity
              const maxVelocity = 2;
              if (particle.velocity.length() > maxVelocity) {
                particle.velocity.normalize().multiplyScalar(maxVelocity);
              }
            }
          }
          
          return { ...particle };
        });
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles, dimensions, mousePosition, containerRef]);
  
  // Calculate connections between particles
  useEffect(() => {
    if (particles.length === 0) return;
    
    const calculateConnections = () => {
      const maxDistance = 100;
      
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          particle.connections = [];
          
          prevParticles.forEach(otherParticle => {
            if (particle === otherParticle) return;
            
            const distance = particle.position.distanceTo(otherParticle.position);
            
            if (distance < maxDistance) {
              particle.connections.push({
                particle: otherParticle,
                distance,
                opacity: 1 - distance / maxDistance
              });
            }
          });
          
          return { ...particle };
        });
      });
    };
    
    const interval = setInterval(calculateConnections, 500);
    
    return () => clearInterval(interval);
  }, [particles]);
  
  return { particles, dimensions };
};

export default useParticleSystem;
