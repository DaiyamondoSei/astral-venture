
import { useState, useEffect, useRef, useMemo } from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';
import { animationScheduler } from '@/utils/animation/AnimationScheduler';

export interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  velocityX: number;
  velocityY: number;
  acceleration?: number;
  rotation?: number;
  rotationSpeed?: number;
  lifetime?: number;
  age?: number;
  [key: string]: any; // Allow for custom properties
}

export interface ParticleSystemOptions {
  // Container dimensions
  width: number;
  height: number;
  
  // Particle generation
  maxParticles: number;
  emissionRate: number; // particles per second
  particleLifetime: [number, number]; // min, max in ms
  
  // Physics
  gravity?: number;
  friction?: number;
  turbulence?: number;
  
  // Visual options
  particleSize: [number, number]; // min, max
  particleColor: string[] | ((p: Particle) => string);
  particleOpacity: [number, number]; // min, max
  particleRotation?: boolean;
  
  // Performance options
  cullingEnabled?: boolean;
  adaptiveQuality?: boolean;
  debugMode?: boolean;
  
  // Callbacks
  onParticleCreate?: (particle: Particle) => Particle;
  onParticleUpdate?: (particle: Particle, deltaTime: number) => Particle;
}

/**
 * Hook for creating high-performance particle systems
 * with automatic performance optimization
 */
export const useHighPerformanceParticles = (
  options: Partial<ParticleSystemOptions> = {}
): {
  particles: Particle[];
  start: () => void;
  stop: () => void;
  emit: (count: number, options?: Partial<ParticleSystemOptions>) => void;
  clear: () => void;
  isRunning: boolean;
} => {
  // Default options with sensible values
  const defaultOptions: ParticleSystemOptions = {
    width: 1000,
    height: 1000,
    maxParticles: 100,
    emissionRate: 5,
    particleLifetime: [2000, 5000],
    gravity: 0,
    friction: 0.02,
    turbulence: 0.1,
    particleSize: [2, 5],
    particleColor: ['#ffffff'],
    particleOpacity: [0.5, 1],
    particleRotation: false,
    cullingEnabled: true,
    adaptiveQuality: true,
    debugMode: false
  };
  
  // Merge default options with provided options
  const mergedOptions = useMemo(() => {
    return { ...defaultOptions, ...options };
  }, [options]);
  
  // Get performance context to adapt behavior
  const { isLowPerformance, isMediumPerformance } = usePerformance();
  
  // Adapt options based on device performance
  const adaptedOptions = useMemo(() => {
    if (!mergedOptions.adaptiveQuality) return mergedOptions;
    
    const adapted = { ...mergedOptions };
    
    if (isLowPerformance) {
      adapted.maxParticles = Math.floor(adapted.maxParticles * 0.3);
      adapted.emissionRate = Math.floor(adapted.emissionRate * 0.5);
      adapted.particleSize = [
        adapted.particleSize[0] * 1.2, 
        adapted.particleSize[1] * 1.2
      ]; // Larger particles but fewer of them
      adapted.cullingEnabled = true;
    } else if (isMediumPerformance) {
      adapted.maxParticles = Math.floor(adapted.maxParticles * 0.7);
      adapted.emissionRate = Math.floor(adapted.emissionRate * 0.8);
    }
    
    return adapted;
  }, [mergedOptions, isLowPerformance, isMediumPerformance]);
  
  // State & refs
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const animationIdRef = useRef<string>(`particles-${Math.random().toString(36).substr(2, 9)}`);
  const lastEmitTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  
  // Start particle system
  const start = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    
    // Register with animation scheduler with appropriate priority
    const priority = isLowPerformance 
      ? 'low' 
      : isMediumPerformance 
        ? 'medium' 
        : 'high';
    
    animationScheduler.register(
      animationIdRef.current,
      updateParticles,
      priority,
      isLowPerformance ? 50 : 0  // Only run at 20fps on low-end devices
    );
  };
  
  // Stop particle system
  const stop = () => {
    if (!isRunning) return;
    
    setIsRunning(false);
    animationScheduler.unregister(animationIdRef.current);
  };
  
  // Clear all particles
  const clear = () => {
    particlesRef.current = [];
    setParticles([]);
  };
  
  // Create a particle with specified properties
  const createParticle = (customOptions?: Partial<ParticleSystemOptions>): Particle => {
    const opts = customOptions ? { ...adaptedOptions, ...customOptions } : adaptedOptions;
    
    // Generate basic particle properties
    const size = opts.particleSize[0] + Math.random() * (opts.particleSize[1] - opts.particleSize[0]);
    const lifetime = opts.particleLifetime[0] + Math.random() * (opts.particleLifetime[1] - opts.particleLifetime[0]);
    const opacity = opts.particleOpacity[0] + Math.random() * (opts.particleOpacity[1] - opts.particleOpacity[0]);
    
    // Create the particle
    const particle: Particle = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * opts.width,
      y: Math.random() * opts.height,
      size,
      color: typeof opts.particleColor === 'function' 
        ? opts.particleColor({} as Particle) 
        : opts.particleColor[Math.floor(Math.random() * opts.particleColor.length)],
      opacity,
      velocityX: (Math.random() - 0.5) * 2,
      velocityY: (Math.random() - 0.5) * 2,
      lifetime,
      age: 0,
      rotation: opts.particleRotation ? Math.random() * 360 : 0,
      rotationSpeed: opts.particleRotation ? (Math.random() - 0.5) * 5 : 0
    };
    
    // Apply any custom modifications from onParticleCreate callback
    if (opts.onParticleCreate) {
      return opts.onParticleCreate(particle);
    }
    
    return particle;
  };
  
  // Emit a specific number of particles
  const emit = (count: number, customOptions?: Partial<ParticleSystemOptions>) => {
    if (!isRunning) return;
    
    // Create new particles
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      if (particlesRef.current.length >= adaptedOptions.maxParticles) break;
      
      newParticles.push(createParticle(customOptions));
    }
    
    // Update refs and state
    if (newParticles.length > 0) {
      particlesRef.current = [...particlesRef.current, ...newParticles];
    }
  };
  
  // Main update function called by the animation scheduler
  const updateParticles = (time: number) => {
    if (!isRunning) return;
    
    // Calculate delta time for smooth animation
    const deltaTime = lastFrameTimeRef.current ? (time - lastFrameTimeRef.current) / 1000 : 0.016;
    lastFrameTimeRef.current = time;
    
    // Automatic emission based on rate
    if (adaptedOptions.emissionRate > 0) {
      const timeSinceLastEmit = time - lastEmitTimeRef.current;
      const emitInterval = 1000 / adaptedOptions.emissionRate;
      
      if (timeSinceLastEmit >= emitInterval) {
        const emitCount = Math.floor(timeSinceLastEmit / emitInterval);
        
        if (emitCount > 0 && particlesRef.current.length < adaptedOptions.maxParticles) {
          emit(emitCount);
          lastEmitTimeRef.current = time;
        }
      }
    }
    
    // Update existing particles
    let updatedParticles = particlesRef.current.map(particle => {
      // Create a copy to work with
      const p = { ...particle };
      
      // Update age
      p.age = (p.age || 0) + deltaTime * 1000;
      
      // Calculate lifetime progress
      const lifeProgress = p.lifetime ? p.age / p.lifetime : 0;
      
      // Apply physics
      p.velocityY += (adaptedOptions.gravity || 0) * deltaTime;
      p.velocityX *= (1 - (adaptedOptions.friction || 0));
      p.velocityY *= (1 - (adaptedOptions.friction || 0));
      
      // Apply turbulence if enabled
      if (adaptedOptions.turbulence) {
        p.velocityX += (Math.random() - 0.5) * adaptedOptions.turbulence * deltaTime;
        p.velocityY += (Math.random() - 0.5) * adaptedOptions.turbulence * deltaTime;
      }
      
      // Update position
      p.x += p.velocityX * 60 * deltaTime; // Normalize to 60fps
      p.y += p.velocityY * 60 * deltaTime;
      
      // Update rotation if enabled
      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed * deltaTime * 60;
      }
      
      // Fade out based on lifetime
      if (p.lifetime) {
        // Fade out in the last 20% of lifetime
        if (lifeProgress > 0.8) {
          p.opacity = particle.opacity * (1 - ((lifeProgress - 0.8) / 0.2));
        }
      }
      
      // Apply any custom updates from callback
      if (adaptedOptions.onParticleUpdate) {
        return adaptedOptions.onParticleUpdate(p, deltaTime);
      }
      
      return p;
    });
    
    // Remove dead particles
    updatedParticles = updatedParticles.filter(p => {
      // Check if lifetime is exceeded
      if (p.lifetime && p.age && p.age >= p.lifetime) {
        return false;
      }
      
      // Culling check for off-screen particles
      if (adaptedOptions.cullingEnabled) {
        const margin = p.size * 2;
        return !(
          p.x < -margin ||
          p.x > adaptedOptions.width + margin ||
          p.y < -margin ||
          p.y > adaptedOptions.height + margin
        );
      }
      
      return true;
    });
    
    // Update ref
    particlesRef.current = updatedParticles;
    
    // Update state (less frequently on low-end devices)
    if (isLowPerformance) {
      // Only update DOM every few frames on low-performance devices
      if (Math.random() < 0.3) {
        setParticles([...updatedParticles]);
      }
    } else {
      setParticles([...updatedParticles]);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      animationScheduler.unregister(animationIdRef.current);
    };
  }, []);
  
  return {
    particles,
    start,
    stop,
    emit,
    clear,
    isRunning
  };
};

export default useHighPerformanceParticles;
