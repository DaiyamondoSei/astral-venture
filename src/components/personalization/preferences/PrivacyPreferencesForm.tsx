
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { PreferencesFormType } from './types';

const PrivacyPreferencesForm: React.FC = () => {
  const form = useFormContext<PreferencesFormType>();
  
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default PrivacyPreferencesForm;
