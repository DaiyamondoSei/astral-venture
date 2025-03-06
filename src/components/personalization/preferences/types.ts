
import { z } from 'zod';
import { UserPreferences } from '@/services/personalization/types';

// Define form schema
export const preferencesSchema = z.object({
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

export type PreferencesFormType = z.infer<typeof preferencesSchema>;

// Helper functions for chakra UI
export function getChakraName(index: number): string {
  const chakraNames = [
    'Root', 'Sacral', 'Solar Plexus', 'Heart', 
    'Throat', 'Third Eye', 'Crown'
  ];
  return chakraNames[index] || 'Unknown';
}

export function getChakraShortName(index: number): string {
  const chakraShortNames = ['R', 'S', 'SP', 'H', 'T', 'TE', 'C'];
  return chakraShortNames[index] || '?';
}

export function getChakraColor(index: number): string {
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
