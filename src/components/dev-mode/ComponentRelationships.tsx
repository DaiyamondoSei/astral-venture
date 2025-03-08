
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { componentAnalyzer } from '@/utils/performance/ComponentAnalyzer';
import { Network, Share2, Maximize2, Minimize2, X } from 'lucide-react';

// Simple component relationships visualization
const ComponentRelationships: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [components, setComponents] = useState<any[]>([]);
  
  // Don't render anything in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  // Update component data when opened
  useEffect(() => {
    if (!isOpen) return;
    
    // Get all components from analyzer
    const allComponents = Array.from(componentAnalyzer['components'].values());
    setComponents(allComponents);
    
  }, [isOpen]);
  
  // Simple component dependency tree renderer
  const renderComponentTree = (component: any, level = 0) => {
    const childComponents = component.childComponents || [];
    const indentation = level * 16;
    
    return (
      <div key={component.name} style={{ marginLeft: `${indentation}px` }} className="mb-1">
        <div className="flex items-center">
          <Badge variant="outline" className="mr-2">
            {component.name}
          </Badge>
          <span className="text-xs text-muted-foreground">
            complexity: {component.complexity}
          </span>
        </div>
        
        {childComponents.map((childName: string) => {
          const childComponent = components.find(c => c.name === childName);
          if (!childComponent) return null;
          return renderComponentTree(childComponent, level + 1);
        })}
      </div>
    );
  };
  
  const containerClasses = isFullscreen
    ? "fixed inset-4 z-50 bg-background/95 backdrop-blur-md shadow-xl rounded-lg border border-border flex flex-col"
    : "fixed bottom-16 right-0 z-50 max-w-md";
  
  return (
    <div className={containerClasses}>
      {!isOpen ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="ml-auto flex items-center space-x-1 bg-background/80 backdrop-blur-sm"
        >
          <Network className="h-4 w-4 mr-1" />
          <span>Component Relationships</span>
        </Button>
      ) : (
        <Card className="flex-1 flex flex-col shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Component Relationships</CardTitle>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Visualize component dependencies and relationships
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-4 pt-2 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {components.length === 0 ? (
                  <div className="text-center text-muted-foreground p-4">
                    <Share2 className="w-8 h-8 mx-auto mb-2" />
                    <p>No component relationships detected yet.</p>
                    <p className="text-xs mt-1">Components will appear as they're registered.</p>
                  </div>
                ) : (
                  <div>
                    {/* Root components (those without parents) */}
                    {components
                      .filter(c => !c.parentComponents || c.parentComponents.length === 0)
                      .map(component => renderComponentTree(component))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComponentRelationships;
