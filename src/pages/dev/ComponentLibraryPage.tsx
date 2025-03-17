
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Component Library Page
 * 
 * A development page showing all available UI components
 */
const ComponentLibraryPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-quantum-100">Component Library</h1>
      
      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Button components for different actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button>Default Button</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button isLoading>Loading</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>A simple card with header and content</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the main content of the card.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Card with Footer</CardTitle>
                <CardDescription>A card with header, content, and footer</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card has a footer section for actions.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inputs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Fields</CardTitle>
              <CardDescription>Various input components for forms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default">Default Input</Label>
                  <Input id="default" placeholder="Enter text here" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="disabled">Disabled Input</Label>
                  <Input id="disabled" placeholder="Disabled input" disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="with-icon">Input with Icon</Label>
                  <div className="relative">
                    <Input id="with-icon" placeholder="Search..." />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-quantum-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Components</CardTitle>
              <CardDescription>Components for page layout and structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-quantum-700 rounded-lg">
                  <p className="font-medium text-quantum-200">Container</p>
                  <p className="text-sm text-quantum-400">Provides consistent padding and max-width</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-quantum-700 rounded-lg">
                    <p className="font-medium text-quantum-200">Grid Item 1</p>
                    <p className="text-sm text-quantum-400">Grid layout example</p>
                  </div>
                  <div className="p-4 border border-quantum-700 rounded-lg">
                    <p className="font-medium text-quantum-200">Grid Item 2</p>
                    <p className="text-sm text-quantum-400">Grid layout example</p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="p-4 border border-quantum-700 rounded-lg flex-1">
                    <p className="font-medium text-quantum-200">Flex Item 1</p>
                    <p className="text-sm text-quantum-400">Flex layout example</p>
                  </div>
                  <div className="p-4 border border-quantum-700 rounded-lg flex-1">
                    <p className="font-medium text-quantum-200">Flex Item 2</p>
                    <p className="text-sm text-quantum-400">Flex layout example</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComponentLibraryPage;
