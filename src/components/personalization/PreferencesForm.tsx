
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { usePersonalization } from '@/hooks/usePersonalization';
import { UserPreferences } from '@/services/personalization';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

// Define form schema
const preferencesSchema = z.object({
  contentCategories: z.array(z.string()).min(1, "Select at least one category"),
  practiceTypes: z.array(z.string()).min(1, "Select at least one practice type"),
  chakraFocus: z.array(z.number()).min(0),
  interfaceTheme: z.enum(['light', 'dark', 'cosmic']),
  notificationFrequency: z.enum(['daily', 'weekly', 'minimal']),
  practiceReminders: z.boolean(),
  contentLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  privacySettings: z.object({
    shareUsageData: z.boolean(),
    allowRecommendations: z.boolean(),
    storeActivityHistory: z.boolean(),
    dataRetentionPeriod: z.number().min(1).max(365)
  })
});

const PreferencesForm: React.FC = () => {
  const { preferences, updatePreferences, updatePrivacySettings, isLoading, isUpdating } = usePersonalization();
  
  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      contentCategories: preferences?.contentCategories || ['meditation', 'reflection'],
      practiceTypes: preferences?.practiceTypes || ['guided-meditation'],
      chakraFocus: preferences?.chakraFocus || [3],
      interfaceTheme: preferences?.interfaceTheme || 'cosmic',
      notificationFrequency: preferences?.notificationFrequency || 'daily',
      practiceReminders: preferences?.practiceReminders || true,
      contentLevel: preferences?.contentLevel || 'beginner',
      privacySettings: {
        shareUsageData: preferences?.privacySettings?.shareUsageData || true,
        allowRecommendations: preferences?.privacySettings?.allowRecommendations || true,
        storeActivityHistory: preferences?.privacySettings?.storeActivityHistory || true,
        dataRetentionPeriod: preferences?.privacySettings?.dataRetentionPeriod || 90
      }
    }
  });
  
  // Update form when preferences load
  React.useEffect(() => {
    if (preferences) {
      form.reset({
        contentCategories: preferences.contentCategories,
        practiceTypes: preferences.practiceTypes,
        chakraFocus: preferences.chakraFocus,
        interfaceTheme: preferences.interfaceTheme,
        notificationFrequency: preferences.notificationFrequency,
        practiceReminders: preferences.practiceReminders,
        contentLevel: preferences.contentLevel,
        privacySettings: preferences.privacySettings
      });
    }
  }, [preferences, form]);
  
  const onSubmit = async (data: z.infer<typeof preferencesSchema>) => {
    try {
      await updatePreferences(data);
      toast({
        title: "Preferences saved",
        description: "Your personalized experience has been updated.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  const onPrivacySubmit = async (data: z.infer<typeof preferencesSchema>['privacySettings']) => {
    try {
      await updatePrivacySettings(data);
      toast({
        title: "Privacy settings saved",
        description: "Your privacy preferences have been updated.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error saving privacy settings",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="animate-pulse bg-card-foreground/10 h-6 w-1/3 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-card-foreground/10 h-4 w-2/3 rounded mt-2"></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="animate-pulse bg-card-foreground/10 h-4 w-1/4 rounded"></div>
              <div className="animate-pulse bg-card-foreground/10 h-10 w-full rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Tabs defaultValue="content">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="interface">Interface</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
      </TabsList>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Preferences</CardTitle>
                <CardDescription>
                  Customize your content experience and what you want to focus on.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="contentCategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Categories</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {['meditation', 'chakras', 'yoga', 'reflection', 'dreams', 'astral', 'energy'].map((category) => (
                          <FormItem key={category} className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value.includes(category)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, category]);
                                  } else {
                                    field.onChange(field.value.filter(v => v !== category));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer">{category.charAt(0).toUpperCase() + category.slice(1)}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="practiceTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practice Types</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {['guided-meditation', 'silent-meditation', 'breathing', 'movement', 'journaling', 'visualization'].map((type) => (
                          <FormItem key={type} className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, type]);
                                  } else {
                                    field.onChange(field.value.filter(v => v !== type));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer">
                              {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="chakraFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chakra Focus</FormLabel>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {field.value.map((chakraIndex) => (
                            <Badge key={chakraIndex} variant="outline" className="px-2 py-1">
                              {getChakraName(chakraIndex)}
                              <button
                                type="button"
                                className="ml-1 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  field.onChange(field.value.filter(v => v !== chakraIndex));
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {[0, 1, 2, 3, 4, 5, 6].map((chakraIndex) => (
                            <Button
                              key={chakraIndex}
                              type="button"
                              size="sm"
                              variant={field.value.includes(chakraIndex) ? "default" : "outline"}
                              className={`p-1 ${getChakraColor(chakraIndex)}`}
                              onClick={() => {
                                if (field.value.includes(chakraIndex)) {
                                  field.onChange(field.value.filter(v => v !== chakraIndex));
                                } else {
                                  field.onChange([...field.value, chakraIndex]);
                                }
                              }}
                            >
                              {getChakraShortName(chakraIndex)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contentLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select content level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Content Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="interface" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Interface & Notification Preferences</CardTitle>
                <CardDescription>
                  Customize your visual experience and notification settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="interfaceTheme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interface theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="cosmic">Cosmic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notificationFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select notification frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="practiceReminders"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Practice Reminders</FormLabel>
                        <FormDescription>
                          Receive reminders for your practice sessions
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Interface Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Form>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(values => onPrivacySubmit(values.privacySettings))}>
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Preferences</CardTitle>
                <CardDescription>
                  Control how your data is used for personalization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="privacySettings.allowRecommendations"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Content Recommendations</FormLabel>
                        <FormDescription>
                          Allow personalized content recommendations
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="privacySettings.storeActivityHistory"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Activity Tracking</FormLabel>
                        <FormDescription>
                          Store your activity history for better personalization
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="privacySettings.shareUsageData"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Usage Data</FormLabel>
                        <FormDescription>
                          Share anonymous usage data to improve the app
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="privacySettings.dataRetentionPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Retention Period (days)</FormLabel>
                      <div className="space-y-2">
                        <Slider
                          value={[field.value]}
                          min={30}
                          max={365}
                          step={30}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                        <div className="flex justify-between">
                          <span>30 days</span>
                          <span>{field.value} days</span>
                          <span>365 days</span>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Data Deletion</h4>
                  <p className="text-sm text-muted-foreground">
                    You can request to delete all of your personalization data at any time.
                  </p>
                  <Button variant="destructive" type="button" onClick={() => {
                    toast({
                      title: "Data deletion",
                      description: "This feature will be available soon.",
                      variant: "default",
                    });
                  }}>
                    Delete All My Data
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  );
};

// Helper functions for chakra UI
function getChakraName(index: number): string {
  const chakraNames = [
    'Root', 'Sacral', 'Solar Plexus', 'Heart', 
    'Throat', 'Third Eye', 'Crown'
  ];
  return chakraNames[index] || 'Unknown';
}

function getChakraShortName(index: number): string {
  const chakraShortNames = ['R', 'S', 'SP', 'H', 'T', 'TE', 'C'];
  return chakraShortNames[index] || '?';
}

function getChakraColor(index: number): string {
  const chakraColors = [
    'hover:bg-red-500 hover:text-white',
    'hover:bg-orange-500 hover:text-white',
    'hover:bg-yellow-500 hover:text-white',
    'hover:bg-green-500 hover:text-white',
    'hover:bg-blue-500 hover:text-white',
    'hover:bg-indigo-500 hover:text-white',
    'hover:bg-purple-500 hover:text-white'
  ];
  return chakraColors[index] || '';
}

export default PreferencesForm;
