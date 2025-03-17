
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * Component Library Demo Page
 * 
 * This page showcases various UI components available in the application
 * for development and testing purposes.
 */
const ComponentLibraryPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Component Library</h1>
      
      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="specialized">Specialized</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Different button styles and variants available in the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Button Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inputs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Inputs</CardTitle>
              <CardDescription>
                Various input components for forms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="Email" />
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" placeholder="Password" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>A simple card component with title and description</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content goes here. This is a basic example of a card component.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Card with interactive elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Cards can contain any content, including buttons and other interactive elements.</p>
                <Button>Action Button</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="specialized" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specialized Components</CardTitle>
              <CardDescription>
                Application-specific components for various features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Energy Visualization</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Components for visualizing energy and chakra systems</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Meditation Tools</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Components for meditation practice and tracking</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Consciousness Metrics</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Components for displaying and tracking consciousness growth</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Reflection Journal</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Components for journaling and reflection</p>
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
