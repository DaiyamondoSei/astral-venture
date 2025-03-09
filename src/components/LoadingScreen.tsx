
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import * as THREE from 'three';
import { markStart, markEnd } from '@/utils/webVitalsMonitor';
import { preloadCriticalAssets } from '@/utils/memoryManager';

interface LoadingScreenProps {
  onLoadComplete?: () => void;
  minDisplayTime?: number; // Minimum time to display in ms
}

// Critical assets to preload
const criticalAssets = [
  '/cosmic-human.svg',
  '/placeholder.svg',
  '/favicon.ico'
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onLoadComplete,
  minDisplayTime = 3000 // Give users time to enjoy the animation
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState<'initial' | 'assets' | 'rendering' | 'complete'>('initial');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize 3D scene
  useEffect(() => {
    markStart('loading-screen-init');
    
    if (!canvasRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Create renderer with transparency
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    // Create Metatron's Cube group
    const metatronGroup = new THREE.Group();
    cubeRef.current = metatronGroup;
    scene.add(metatronGroup);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x333366, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);
    
    // Create sparkle particles for nebula effect
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Random position within a sphere
      const radius = 10 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random sizes
      particleSizes[i] = Math.random() * 2;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    // Create nebula particle material
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 0.1,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Create Metatron's Cube geometry
    createMetatronsCube(metatronGroup);
    
    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation function
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !cubeRef.current) return;
      
      // Rotate cube slowly
      cubeRef.current.rotation.y += 0.002;
      cubeRef.current.rotation.x += 0.001;
      
      // Rotate particles subtly
      particles.rotation.y += 0.0003;
      
      // Pulse size of particles
      const time = Date.now() * 0.001;
      const sizes = particleGeometry.attributes.size.array;
      
      for (let i = 0; i < particleCount; i++) {
        const pulseFactor = 0.5 + 0.5 * Math.sin(time + i * 0.1);
        sizes[i] = particleSizes[i] * pulseFactor;
      }
      particleGeometry.attributes.size.needsUpdate = true;
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    setLoadingPhase('assets');
    
    const duration = markEnd('loading-screen-init');
    console.log(`Loading screen initialized in ${duration.toFixed(2)}ms`);
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Dispose resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // Dispose geometries and materials in Metatron's Cube
      if (cubeRef.current) {
        cubeRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }
      
      // Dispose particle resources
      if (particles) {
        if (particles.geometry) particles.geometry.dispose();
        if (particles.material) {
          if (Array.isArray(particles.material)) {
            particles.material.forEach(material => material.dispose());
          } else {
            particles.material.dispose();
          }
        }
      }
    };
  }, []);
  
  // Function to create the Metatron's Cube
  const createMetatronsCube = (group: THREE.Group) => {
    // Material for lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7
    });
    
    // Calculate the positions of the 13 spheres in Metatron's Cube
    const positions = [];
    const radius = 1.2;
    
    // Central sphere
    positions.push(new THREE.Vector3(0, 0, 0));
    
    // Inner ring of 6 spheres
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      positions.push(new THREE.Vector3(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        0
      ));
    }
    
    // Outer ring of 6 spheres
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      positions.push(new THREE.Vector3(
        radius * 2 * Math.cos(angle),
        radius * 2 * Math.sin(angle),
        0
      ));
    }
    
    // Create geometry for sphere nodes
    const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    });
    
    // Add nodes (spheres) to group
    positions.forEach(position => {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(position);
      group.add(sphere);
    });
    
    // Connect spheres with lines to form Metatron's Cube
    // Inner connections
    for (let i = 1; i <= 6; i++) {
      for (let j = i + 1; j <= 6; j++) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          positions[i],
          positions[j]
        ]);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
      }
    }
    
    // Connect center to inner ring
    for (let i = 1; i <= 6; i++) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        positions[0],
        positions[i]
      ]);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);
    }
    
    // Connect inner ring to outer ring
    for (let i = 1; i <= 6; i++) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        positions[i],
        positions[i + 6]
      ]);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);
    }
    
    // Connect outer ring
    for (let i = 7; i <= 12; i++) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        positions[i],
        positions[i < 12 ? i + 1 : 7]
      ]);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);
    }
    
    // Additional sacred geometry lines
    const additionalConnections = [
      [1, 9], [1, 11], 
      [2, 8], [2, 12], 
      [3, 7], [3, 11], 
      [4, 10], [4, 8], 
      [5, 9], [5, 7], 
      [6, 10], [6, 12]
    ];
    
    additionalConnections.forEach(([i, j]) => {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        positions[i],
        positions[j]
      ]);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);
    });
  };
  
  // Simulate loading by preloading assets and incrementing progress
  useEffect(() => {
    if (loadingPhase === 'assets') {
      markStart('asset-preloading');
      
      // Define how many progress increments we'll divide across preloading
      const progressSteps = 80; // Reserve 80% of progress for preloading
      let completedSteps = 0;
      
      // Preload critical assets
      const preloadPromises = preloadCriticalAssets(criticalAssets);
      
      // Update progress as assets load
      preloadPromises.forEach(promise => {
        promise.then(() => {
          completedSteps++;
          const assetProgress = (completedSteps / preloadPromises.length) * progressSteps;
          setProgress(Math.min(assetProgress, progressSteps));
        });
      });
      
      // When all assets are loaded, move to rendering phase
      Promise.all(preloadPromises).then(() => {
        const duration = markEnd('asset-preloading');
        console.log(`Assets preloaded in ${duration.toFixed(2)}ms`);
        setLoadingPhase('rendering');
        
        // Simulate remaining progress for app rendering
        let currentProgress = progressSteps;
        const remainingSteps = 100 - progressSteps;
        const renderingInterval = setInterval(() => {
          currentProgress += remainingSteps / 10;
          if (currentProgress >= 100) {
            clearInterval(renderingInterval);
            setProgress(100);
            setLoadingPhase('complete');
          } else {
            setProgress(currentProgress);
          }
        }, 200);
        
        return () => clearInterval(renderingInterval);
      });
    }
  }, [loadingPhase]);
  
  // Handle completion
  useEffect(() => {
    if (loadingPhase === 'complete') {
      const startTime = Date.now();
      
      // Ensure minimum display time and wait for 100% progress
      const checkCompletion = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        if (progress >= 100 && elapsedTime >= minDisplayTime) {
          clearInterval(checkCompletion);
          
          // Fade out animation then call complete
          setTimeout(() => {
            setIsVisible(false);
            if (onLoadComplete) setTimeout(onLoadComplete, 500);
          }, 500);
        }
      }, 100);
      
      return () => {
        clearInterval(checkCompletion);
      };
    }
  }, [progress, minDisplayTime, onLoadComplete, loadingPhase]);
  
  // Loading phase text
  const getLoadingText = () => {
    switch (loadingPhase) {
      case 'initial':
        return 'Initializing Quantum Field';
      case 'assets':
        return 'Aligning Sacred Geometry';
      case 'rendering':
        return 'Calibrating Consciousness Interface';
      case 'complete':
        return 'Quantum Field Aligned';
      default:
        return 'Loading';
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={cn(
            "fixed inset-0 z-50 flex flex-col items-center justify-center",
            "bg-gradient-to-br from-[#0C0A20] via-[#231748] to-[#190A38] overflow-hidden"
          )}
          initial={{ opacity: 1 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 3D Canvas for Metatron's Cube */}
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 z-10"
          />
          
          {/* Content overlay */}
          <div className="relative z-20 flex flex-col items-center max-w-md px-4">
            {/* App Title */}
            <motion.div 
              className="text-center text-white mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl mb-2 font-display tracking-widest">QUANEX</h2>
              <p className="text-sm text-white/70">Awakening Consciousness</p>
            </motion.div>
            
            {/* Progress bar */}
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-6 mb-2">
              <motion.div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
            
            {/* Progress percentage */}
            <motion.p 
              className="text-xs text-white/60 mt-2 font-mono"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.floor(progress)}% • {getLoadingText()}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
