
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const DesignSystemDemo: React.FC = () => {
  const { toast } = useToast();
  
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Design System Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates the key UI components in our design system.
        </p>
      </div>
      
      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buttons" className="space-y-6 py-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button size="default">Default Size</Button>
            <Button size="sm">Small Size</Button>
            <Button size="lg">Large Size</Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => toast({ title: "Button Clicked", description: "You clicked the button." })}>
              Show Toast
            </Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline" className="bg-quantum-800 border-quantum-700">
              Custom Style
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-6 py-4">
          <h2 className="text-2xl font-semibold">Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card Description</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card Content</p>
              </CardContent>
              <CardFooter>
                <Button>Card Action</Button>
              </CardFooter>
            </Card>
            
            <Card className="border-quantum-700 bg-quantum-800/50">
              <CardHeader>
                <CardTitle>Custom Style</CardTitle>
                <CardDescription>With custom background</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Using our theme colors</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Action</Button>
              </CardFooter>
            </Card>
            
            <Card className="border-purple-600/30">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-t-lg">
                <CardTitle>Gradient Header</CardTitle>
                <CardDescription>With purple border</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content with special styling</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="border-purple-600/50">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="forms" className="space-y-6 py-4">
          <h2 className="text-2xl font-semibold">Forms</h2>
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Login Form</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Login</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="typography" className="space-y-6 py-4">
          <h2 className="text-2xl font-semibold">Typography</h2>
          
          <div className="space-y-4">
            <div>
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Heading 1
              </h1>
              <p className="text-sm text-muted-foreground">4xl/5xl font size with extrabold weight</p>
            </div>
            
            <div>
              <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                Heading 2
              </h2>
              <p className="text-sm text-muted-foreground">3xl font size with semibold weight</p>
            </div>
            
            <div>
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Heading 3
              </h3>
              <p className="text-sm text-muted-foreground">2xl font size with semibold weight</p>
            </div>
            
            <div>
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Heading 4
              </h4>
              <p className="text-sm text-muted-foreground">xl font size with semibold weight</p>
            </div>
            
            <div>
              <p className="leading-7">
                This is a paragraph of text. The leading (line height) is set to 7. The text
                color is inherited from the parent element. This is good for regular body text.
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">
                This is small muted text, good for captions, descriptions, and other secondary content.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignSystemDemo;
