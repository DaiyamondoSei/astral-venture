
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import MetatronsCube from '@/components/visual-foundation/metatrons-cube/MetatronsCube';
import { CubeSize, CubeTheme, MetatronsNode, CubeConnection } from '@/components/visual-foundation/metatrons-cube/types';

/**
 * Design system demo page that showcases UI components and visual elements
 */
const DesignSystemDemo: React.FC = () => {
  const [cubeVariant, setCubeVariant] = useState<CubeTheme>('default');
  const [cubeSize, setCubeSize] = useState<CubeSize>('md');
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>(undefined);
  const [intensity, setIntensity] = useState<number>(5);
  const [withAnimation, setWithAnimation] = useState<boolean>(true);
  
  // Sample nodes for MetatronsCube
  const nodes: MetatronsNode[] = [
    // Center node
    { id: 'center', x: 200, y: 200, size: 16 },
    
    // Inner hexagon
    { id: 'inner1', x: 200, y: 150, size: 12 },
    { id: 'inner2', x: 243, y: 175, size: 12 },
    { id: 'inner3', x: 243, y: 225, size: 12 },
    { id: 'inner4', x: 200, y: 250, size: 12 },
    { id: 'inner5', x: 157, y: 225, size: 12 },
    { id: 'inner6', x: 157, y: 175, size: 12 },
    
    // Outer nodes
    { id: 'outer1', x: 200, y: 100, size: 10, label: 'Meditation' },
    { id: 'outer2', x: 286, y: 150, size: 10, label: 'Wisdom' },
    { id: 'outer3', x: 286, y: 250, size: 10, label: 'Energy' },
    { id: 'outer4', x: 200, y: 300, size: 10, label: 'Practice' },
    { id: 'outer5', x: 114, y: 250, size: 10, label: 'Chakras' },
    { id: 'outer6', x: 114, y: 150, size: 10, label: 'Insights' },
  ].map(node => ({
    ...node,
    active: node.id === activeNodeId,
    pulsing: node.id === activeNodeId
  }));
  
  // Sample connections for MetatronsCube
  const connections: CubeConnection[] = [
    // Connect center to inner hexagon
    { source: 'center', target: 'inner1' },
    { source: 'center', target: 'inner2' },
    { source: 'center', target: 'inner3' },
    { source: 'center', target: 'inner4' },
    { source: 'center', target: 'inner5' },
    { source: 'center', target: 'inner6' },
    
    // Connect inner hexagon
    { source: 'inner1', target: 'inner2' },
    { source: 'inner2', target: 'inner3' },
    { source: 'inner3', target: 'inner4' },
    { source: 'inner4', target: 'inner5' },
    { source: 'inner5', target: 'inner6' },
    { source: 'inner6', target: 'inner1' },
    
    // Connect inner to outer
    { source: 'inner1', target: 'outer1' },
    { source: 'inner2', target: 'outer2' },
    { source: 'inner3', target: 'outer3' },
    { source: 'inner4', target: 'outer4' },
    { source: 'inner5', target: 'outer5' },
    { source: 'inner6', target: 'outer6' },
    
    // Connect outer hexagon
    { source: 'outer1', target: 'outer2' },
    { source: 'outer2', target: 'outer3' },
    { source: 'outer3', target: 'outer4' },
    { source: 'outer4', target: 'outer5' },
    { source: 'outer5', target: 'outer6' },
    { source: 'outer6', target: 'outer1' },
  ].map(conn => ({
    ...conn,
    active: conn.source === activeNodeId || conn.target === activeNodeId
  }));
  
  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    setActiveNodeId(activeNodeId === nodeId ? undefined : nodeId);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Design System Demo</h1>
      
      <Tabs defaultValue="components">
        <TabsList className="mb-4">
          <TabsTrigger value="components">UI Components</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="components" className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-2">Basic Card</h3>
                <p className="text-muted-foreground">This is a simple card component.</p>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-2">With Actions</h3>
                <p className="text-muted-foreground mb-4">This card has a button.</p>
                <Button variant="outline" size="sm">Action</Button>
              </Card>
              
              <Card className="p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 h-32"></div>
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">With Image</h3>
                  <p className="text-muted-foreground">This card has a gradient header.</p>
                </div>
              </Card>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" />
                  <Label htmlFor="notifications">Enable notifications</Label>
                </div>
                
                <Button className="mt-2">Submit</Button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Volume Control</Label>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
                
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>
        
        <TabsContent value="visualization" className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Metatron's Cube</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="variant">Variant</Label>
                  <select 
                    id="variant" 
                    className="w-full p-2 rounded-md border"
                    value={cubeVariant}
                    onChange={(e) => setCubeVariant(e.target.value as CubeTheme)}
                  >
                    <option value="default">Default</option>
                    <option value="cosmic">Cosmic</option>
                    <option value="ethereal">Ethereal</option>
                    <option value="quantum">Quantum</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <select 
                    id="size" 
                    className="w-full p-2 rounded-md border"
                    value={cubeSize}
                    onChange={(e) => setCubeSize(e.target.value as CubeSize)}
                  >
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Intensity</Label>
                  <Slider 
                    value={[intensity]} 
                    min={1} 
                    max={10} 
                    step={1}
                    onValueChange={(value) => setIntensity(value[0])}
                  />
                  <p className="text-sm text-muted-foreground">Level: {intensity}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="animation" 
                    checked={withAnimation}
                    onCheckedChange={setWithAnimation}
                  />
                  <Label htmlFor="animation">Enable animation</Label>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Click on nodes to activate them. Active node: {activeNodeId || 'None'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveNodeId(undefined)}
                  >
                    Reset Selection
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center bg-black/10 rounded-lg p-4">
                <MetatronsCube
                  variant={cubeVariant}
                  size={cubeSize}
                  nodes={nodes}
                  connections={connections}
                  activeNodeId={activeNodeId}
                  onNodeClick={handleNodeClick}
                  withAnimation={withAnimation}
                  intensity={intensity}
                />
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignSystemDemo;
