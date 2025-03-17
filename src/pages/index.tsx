
import { Button } from "@/components/ui/button";
import { AiAnalysisDemo } from "@/components/ai/AiAnalysisDemo";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, BarChart, Gauge } from "lucide-react";

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col p-8 font-sans"
    >
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold mb-6 text-center">AI-Powered Analysis System</h1>
        <p className="text-xl text-center text-muted-foreground mb-10">
          Offloading heavy analysis to OpenAI API for enhanced insights
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Chakra Analysis
              </CardTitle>
              <CardDescription>
                AI-powered insights into chakra activations and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Offload complex chakra pattern analysis to the OpenAI API, which can process emotional connections,
                reflection content, and chakra activations to provide personalized insights and recommendations.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                AI interpretation of application performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Let AI analyze complex performance metrics including component render times, memory usage, and network requests
                to identify bottlenecks and provide optimization recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-10">
          <AiAnalysisDemo />
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gauge className="mr-2 h-5 w-5" />
              Implementation Progress
            </CardTitle>
            <CardDescription>
              Phase 1 of the AI integration plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Completed Features:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Enhanced AI Analysis Service with caching and offline fallbacks</li>
                  <li>AI Analysis Context Provider for app-wide access</li>
                  <li>Secure edge function for OpenAI API integration</li>
                  <li>API key management system</li>
                  <li>Demo component showcasing AI capabilities</li>
                </ul>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium">Next Steps:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Integrate AI analysis with existing components</li>
                  <li>Enhance data visualization for AI insights</li>
                  <li>Implement performance monitoring and metrics tracking</li>
                  <li>Add visual analysis capabilities</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Zap className="mr-2 h-4 w-4" />
              Continue with Phase 2 Implementation
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
