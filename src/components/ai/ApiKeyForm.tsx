
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAIAnalysisContext } from '@/contexts/AIAnalysisContext';
import { useToast } from '@/components/ui/use-toast';

interface ApiKeyFormProps {
  onSuccess?: () => void;
  showCancel?: boolean;
  onCancel?: () => void;
}

export function ApiKeyForm({ onSuccess, showCancel = false, onCancel }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setApiKey: setContextApiKey, hasApiKey } = useAIAnalysisContext();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Set the API key in the context
      setContextApiKey(apiKey);
      
      // Show success message
      toast({
        title: "Success",
        description: "API key has been saved",
        variant: "default"
      });
      
      // Clear the form
      setApiKey('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error setting API key:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save API key",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>OpenAI API Key</CardTitle>
        <CardDescription>
          Enter your OpenAI API key to enable AI-powered analysis features.
          {hasApiKey && (
            <p className="text-green-600 mt-2">✓ API key is currently set</p>
          )}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input
                id="apiKey"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
                autoComplete="off"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {showCancel && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : hasApiKey ? "Update API Key" : "Save API Key"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default ApiKeyForm;
