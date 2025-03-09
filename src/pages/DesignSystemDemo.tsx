
import React, { useState } from 'react';
import { 
  VisualSystem,
  MetatronsCube,
  GlassmorphicContainer,
  QuantumThemeProvider,
  useQuantumTheme
} from '@/components/visual-foundation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const GlassmorphicDemo = () => {
  const { 
    theme, 
    accent, 
    setTheme, 
    setAccent,
    cosmicIntensity,
    setCosmicIntensity,
    glassmorphismLevel,
    setGlassmorphismLevel,
    animationLevel,
    setAnimationLevel
  } = useQuantumTheme();
  
  const [showMetatronsCube, setShowMetatronsCube] = useState(true);
  const [activeNodes, setActiveNodes] = useState<number[]>([0, 3, 7, 11]);
  const [spinSpeed, setSpinSpeed] = useState(0.2);
  
  // Handle node selection in Metatron's Cube
  const handleNodeClick = (nodeId: number) => {
    if (activeNodes.includes(nodeId)) {
      setActiveNodes(activeNodes.filter(id => id !== nodeId));
    } else {
      setActiveNodes([...activeNodes, nodeId]);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Control Panel */}
      <GlassmorphicContainer
        className="fixed top-4 right-4 z-50 p-6 w-80 max-h-[90vh] overflow-y-auto"
        variant="dark"
        intensity="high"
        withGlow
        glowColor="rgba(139, 92, 246, 0.3)"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Design System Controls</h2>
        
        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-2">
            <Label className="text-white">Theme</Label>
            <Select value={theme} onValueChange={(val) => setTheme(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantum">Quantum</SelectItem>
                <SelectItem value="astral">Astral</SelectItem>
                <SelectItem value="ethereal">Ethereal</SelectItem>
                <SelectItem value="default">Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Accent Selection */}
          <div className="space-y-2">
            <Label className="text-white">Accent Color</Label>
            <Select value={accent} onValueChange={(val) => setAccent(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select accent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="pink">Pink</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Background Intensity */}
          <div className="space-y-2">
            <Label className="text-white">Cosmic Intensity</Label>
            <Select value={cosmicIntensity} onValueChange={(val) => setCosmicIntensity(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select intensity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Glassmorphism Level */}
          <div className="space-y-2">
            <Label className="text-white">Glassmorphism Level</Label>
            <Select value={glassmorphismLevel} onValueChange={(val) => setGlassmorphismLevel(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Subtle</SelectItem>
                <SelectItem value="medium">Moderate</SelectItem>
                <SelectItem value="high">Intense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Animation Level */}
          <div className="space-y-2">
            <Label className="text-white">Animation Level</Label>
            <Select value={animationLevel} onValueChange={(val) => setAnimationLevel(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="immersive">Immersive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Metatron's Cube Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Show Metatron's Cube</Label>
              <Switch 
                checked={showMetatronsCube} 
                onCheckedChange={setShowMetatronsCube} 
              />
            </div>
            
            {showMetatronsCube && (
              <>
                <div className="space-y-2">
                  <Label className="text-white">Spin Speed: {spinSpeed.toFixed(1)}</Label>
                  <Slider 
                    min={0} 
                    max={1} 
                    step={0.1} 
                    value={[spinSpeed]} 
                    onValueChange={(vals) => setSpinSpeed(vals[0])} 
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </GlassmorphicContainer>
      
      {/* Main demo content */}
      <VisualSystem showBackground={true} showMetatronsCube={showMetatronsCube}>
        <div className="container mx-auto py-20 min-h-screen flex flex-col items-center justify-center space-y-16">
          <div className="text-center z-10">
            <h1 className="text-5xl font-bold text-white mb-4">Quantum Design System</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              A comprehensive visual system for the Quantum Consciousness application,
              featuring cosmic backgrounds, sacred geometry, and glassmorphic design elements.
            </p>
          </div>
          
          {/* Interactive Metatron's Cube */}
          <div className="relative flex justify-center">
            <GlassmorphicContainer 
              className="p-10 flex flex-col items-center"
              variant={theme === 'default' ? 'default' : theme}
              intensity={glassmorphismLevel}
              withGlow
              glowColor={`rgba(139, 92, 246, ${glassmorphismLevel === 'low' ? 0.3 : glassmorphismLevel === 'medium' ? 0.5 : 0.7})`}
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Interactive Metatron's Cube</h2>
              <div className="mb-4">
                <MetatronsCube 
                  size={300}
                  interactive
                  onNodeClick={handleNodeClick}
                  activeNodes={activeNodes}
                  spinSpeed={0}
                />
              </div>
              <p className="text-white/80 mt-4 text-center max-w-sm">
                Click on the nodes to activate different energy points within the sacred geometry.
              </p>
            </GlassmorphicContainer>
          </div>
          
          {/* Glassmorphic Container Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 w-full max-w-6xl">
            {/* Default Container */}
            <GlassmorphicContainer 
              className="p-6"
              variant="default"
              intensity={glassmorphismLevel}
              withGlow={animationLevel !== 'minimal'}
              withMotion={animationLevel !== 'minimal'}
              interactive={animationLevel !== 'minimal'}
            >
              <h3 className="text-xl font-medium text-white mb-3">Default Style</h3>
              <p className="text-white/80">
                Simple and elegant glassmorphic container with subtle transparency
                and backdrop blur effect.
              </p>
              <Button className="mt-4">Default Action</Button>
            </GlassmorphicContainer>
            
            {/* Quantum Container */}
            <GlassmorphicContainer 
              className="p-6"
              variant="quantum"
              intensity={glassmorphismLevel}
              withGlow={animationLevel !== 'minimal'}
              withMotion={animationLevel !== 'minimal'}
              interactive={animationLevel !== 'minimal'}
            >
              <h3 className="text-xl font-medium text-white mb-3">Quantum Style</h3>
              <p className="text-white/80">
                Deep purple quantum-themed glassmorphic container with
                energetic glow effects.
              </p>
              <Button variant="secondary" className="mt-4">Quantum Action</Button>
            </GlassmorphicContainer>
            
            {/* Astral Container */}
            <GlassmorphicContainer 
              className="p-6"
              variant="astral"
              intensity={glassmorphismLevel}
              withGlow={animationLevel !== 'minimal'}
              withMotion={animationLevel !== 'minimal'}
              interactive={animationLevel !== 'minimal'}
            >
              <h3 className="text-xl font-medium text-white mb-3">Astral Style</h3>
              <p className="text-white/80">
                Cosmic blue astral-themed glassmorphic container representing
                higher consciousness.
              </p>
              <Button variant="outline" className="mt-4">Astral Action</Button>
            </GlassmorphicContainer>
            
            {/* Light Container */}
            <GlassmorphicContainer 
              className="p-6"
              variant="light"
              intensity={glassmorphismLevel}
              withGlow={animationLevel !== 'minimal'}
              withMotion={animationLevel !== 'minimal'}
              interactive={animationLevel !== 'minimal'}
            >
              <h3 className="text-xl font-medium text-white mb-3">Light Style</h3>
              <p className="text-white/80">
                Brighter glassmorphic container with higher opacity
                for more visibility.
              </p>
              <Button variant="destructive" className="mt-4">Light Action</Button>
            </GlassmorphicContainer>
            
            {/* Dark Container */}
            <GlassmorphicContainer 
              className="p-6"
              variant="dark"
              intensity={glassmorphismLevel}
              withGlow={animationLevel !== 'minimal'}
              withMotion={animationLevel !== 'minimal'}
              interactive={animationLevel !== 'minimal'}
            >
              <h3 className="text-xl font-medium text-white mb-3">Dark Style</h3>
              <p className="text-white/80">
                Darker glassmorphic container for areas requiring more contrast
                and focus.
              </p>
              <Button variant="ghost" className="mt-4">Dark Action</Button>
            </GlassmorphicContainer>
            
            {/* Ethereal Container */}
            <GlassmorphicContainer 
              className="p-6"
              variant="ethereal"
              intensity={glassmorphismLevel}
              withGlow={animationLevel !== 'minimal'}
              withMotion={animationLevel !== 'minimal'}
              interactive={animationLevel !== 'minimal'}
            >
              <h3 className="text-xl font-medium text-white mb-3">Ethereal Style</h3>
              <p className="text-white/80">
                Teal ethereal-themed glassmorphic container with gentle energy
                for healing sections.
              </p>
              <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">Ethereal Action</Button>
            </GlassmorphicContainer>
          </div>
        </div>
      </VisualSystem>
    </div>
  );
};

const DesignSystemDemo = () => {
  return (
    <QuantumThemeProvider>
      <GlassmorphicDemo />
    </QuantumThemeProvider>
  );
};

export default DesignSystemDemo;
