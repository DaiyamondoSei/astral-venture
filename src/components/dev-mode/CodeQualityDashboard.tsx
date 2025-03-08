
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Code, BarChart3, Layers, X, Maximize2, Minimize2 } from 'lucide-react';
import { useCodeQuality, CodeQualityIssue } from '@/hooks/useCodeQuality';

const CodeQualityDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedComponent, setSelectedComponent] = useState<string | undefined>(undefined);
  
  // Don't render anything in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const { issues, stats } = useCodeQuality(selectedComponent);
  
  // Group issues by type for the tabs
  const issuesByType = {
    all: issues,
    performance: issues.filter(i => i.type === 'performance' || i.type === 'render'),
    complexity: issues.filter(i => i.type === 'complexity'),
    architecture: issues.filter(i => i.type === 'architecture')
  };
  
  // Generate a summary of components with issues
  const componentsWithIssues = [...new Set(issues.map(i => i.component))];
  
  // Generate metrics for the summary
  const metrics = [
    { label: 'Components Analyzed', value: stats.componentsAnalyzed },
    { label: 'Total Issues', value: stats.totalIssues },
    { label: 'Critical Issues', value: stats.criticalIssues },
    { label: 'High Priority', value: stats.highPriorityIssues },
  ];
  
  const containerClasses = isFullscreen
    ? "fixed inset-4 z-50 bg-background/95 backdrop-blur-md shadow-xl rounded-lg border border-border flex flex-col"
    : "fixed bottom-16 left-0 z-50 max-w-2xl";
  
  // Render issue card
  const renderIssueCard = (issue: CodeQualityIssue) => (
    <Card key={issue.id} className="mb-3 shadow-sm overflow-hidden">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getBadgeVariant(issue.severity)} className="capitalize">
              {issue.severity}
            </Badge>
            <Badge variant="outline">{issue.type}</Badge>
          </div>
          <Badge variant="outline" className="font-mono">{issue.component}</Badge>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm mb-2">{issue.description}</p>
        <p className="text-sm text-muted-foreground italic">{issue.suggestion}</p>
      </CardContent>
    </Card>
  );
  
  return (
    <div className={containerClasses}>
      {!isOpen ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="ml-auto flex items-center space-x-1 bg-background/80 backdrop-blur-sm"
        >
          <Code className="h-4 w-4 mr-1" />
          <span>Code Quality</span>
          {stats.criticalIssues > 0 && (
            <Badge variant="destructive" className="ml-2">
              {stats.criticalIssues}
            </Badge>
          )}
        </Button>
      ) : (
        <Card className="flex-1 flex flex-col shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Code Quality Dashboard</CardTitle>
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
              Last updated: {stats.lastUpdated.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          
          {/* Dashboard Summary */}
          <div className="grid grid-cols-4 gap-2 px-6 py-2">
            {metrics.map(metric => (
              <div key={metric.label} className="text-center">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
          
          {/* Component Filter */}
          {componentsWithIssues.length > 0 && (
            <div className="px-6 py-2">
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedComponent && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedComponent(undefined)}
                    className="text-xs h-7"
                  >
                    Clear filter
                  </Button>
                )}
                {componentsWithIssues.map(comp => (
                  <Badge 
                    key={comp}
                    variant={selectedComponent === comp ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedComponent(comp)}
                  >
                    {comp}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Issue Tabs */}
          <Tabs 
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div className="px-6">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  All Issues
                  <Badge variant="outline" className="ml-2">{issuesByType.all.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex-1">
                  Performance
                  <Badge variant="outline" className="ml-2">{issuesByType.performance.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="complexity" className="flex-1">
                  Complexity
                  <Badge variant="outline" className="ml-2">{issuesByType.complexity.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="architecture" className="flex-1">
                  Architecture
                  <Badge variant="outline" className="ml-2">{issuesByType.architecture.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="flex-1 overflow-hidden pt-2">
              <ScrollArea className="h-full pr-4">
                <TabsContent value="all" className="mt-0">
                  {issuesByType.all.length === 0 ? (
                    <EmptyState type="all" />
                  ) : (
                    issuesByType.all.map(renderIssueCard)
                  )}
                </TabsContent>
                
                <TabsContent value="performance" className="mt-0">
                  {issuesByType.performance.length === 0 ? (
                    <EmptyState type="performance" />
                  ) : (
                    issuesByType.performance.map(renderIssueCard)
                  )}
                </TabsContent>
                
                <TabsContent value="complexity" className="mt-0">
                  {issuesByType.complexity.length === 0 ? (
                    <EmptyState type="complexity" />
                  ) : (
                    issuesByType.complexity.map(renderIssueCard)
                  )}
                </TabsContent>
                
                <TabsContent value="architecture" className="mt-0">
                  {issuesByType.architecture.length === 0 ? (
                    <EmptyState type="architecture" />
                  ) : (
                    issuesByType.architecture.map(renderIssueCard)
                  )}
                </TabsContent>
              </ScrollArea>
            </CardContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

// Empty state component
const EmptyState = ({ type }: { type: string }) => (
  <div className="text-center text-muted-foreground p-6">
    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
    <p>No {type === 'all' ? '' : type} issues detected.</p>
    <p className="text-xs mt-1">Great job keeping the code clean!</p>
  </div>
);

// Helper function for badge variants
const getBadgeVariant = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

export default CodeQualityDashboard;
