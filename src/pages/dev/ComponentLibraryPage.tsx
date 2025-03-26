
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

/**
 * Component Library Page
 * 
 * A showcase of available UI components for developers.
 */
const ComponentLibraryPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Component Library</h1>
        <p className="text-gray-500 dark:text-gray-400">
          A showcase of available UI components for development
        </p>
      </div>
      
      <Tabs defaultValue="buttons" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
        </TabsList>
        
        {/* Buttons Section */}
        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Button components in different variants and sizes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              
              <Separator />
              
              <div className="flex flex-wrap gap-4 items-center">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Inputs Section */}
        <TabsContent value="inputs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Controls</CardTitle>
              <CardDescription>Input, checkbox, switch, and slider components.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email address" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Your password" />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications">Enable notifications</Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Volume Level</Label>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Cards Section */}
        <TabsContent value="cards" className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Card</CardTitle>
              <CardDescription>A simple card with header and content.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is a basic card component that can be used to group related content.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>A card with interactive elements.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card includes a button in the footer for actions.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Submit</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Data Display Section */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Display Components</CardTitle>
              <CardDescription>Badges, avatars, and other data display components.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Avatars</h3>
                <div className="flex flex-wrap gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  
                  <Avatar>
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
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
