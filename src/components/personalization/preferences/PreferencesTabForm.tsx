
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { PreferencesFormType, preferencesSchema } from './types';
import ContentPreferencesForm from './ContentPreferencesForm';
import InterfacePreferencesForm from './InterfacePreferencesForm';
import PrivacyPreferencesForm from './PrivacyPreferencesForm';

const PreferencesTabForm: React.FC = () => {
  const { preferences, updatePreferences, updatePrivacySettings, isLoading, isUpdating } = usePersonalization();
  
  const form = useForm<PreferencesFormType>({
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
        shareUsageData: preferences?.privacySettings?.shareUsageData ?? true,
        allowRecommendations: preferences?.privacySettings?.allowRecommendations ?? true,
        storeActivityHistory: preferences?.privacySettings?.storeActivityHistory ?? true,
        dataRetentionPeriod: preferences?.privacySettings?.dataRetentionPeriod ?? 90
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
        privacySettings: {
          shareUsageData: preferences.privacySettings.shareUsageData,
          allowRecommendations: preferences.privacySettings.allowRecommendations,
          storeActivityHistory: preferences.privacySettings.storeActivityHistory,
          dataRetentionPeriod: preferences.privacySettings.dataRetentionPeriod
        }
      });
    }
  }, [preferences, form]);
  
  const onSubmit = async (data: PreferencesFormType) => {
    try {
      await updatePreferences({
        contentCategories: data.contentCategories,
        practiceTypes: data.practiceTypes,
        chakraFocus: data.chakraFocus,
        interfaceTheme: data.interfaceTheme,
        notificationFrequency: data.notificationFrequency,
        practiceReminders: data.practiceReminders,
        contentLevel: data.contentLevel,
        privacySettings: {
          shareUsageData: data.privacySettings.shareUsageData,
          allowRecommendations: data.privacySettings.allowRecommendations,
          storeActivityHistory: data.privacySettings.storeActivityHistory,
          dataRetentionPeriod: data.privacySettings.dataRetentionPeriod
        }
      });
      
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
  
  const onPrivacySubmit = async (data: PreferencesFormType['privacySettings']) => {
    try {
      await updatePrivacySettings({
        shareUsageData: data.shareUsageData,
        allowRecommendations: data.allowRecommendations,
        storeActivityHistory: data.storeActivityHistory,
        dataRetentionPeriod: data.dataRetentionPeriod
      });
      
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

  return (
    <Tabs defaultValue="content">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="interface">Interface</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
      </TabsList>
      
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Preferences</CardTitle>
                <CardDescription>
                  Customize your content experience and what you want to focus on.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentPreferencesForm />
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
              <CardContent>
                <InterfacePreferencesForm />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Interface Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </FormProvider>
      
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(values => onPrivacySubmit(values.privacySettings))}>
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Preferences</CardTitle>
                <CardDescription>
                  Control how your data is used for personalization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PrivacyPreferencesForm />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </FormProvider>
    </Tabs>
  );
};

export default PreferencesTabForm;
