
import { Json } from '@/integrations/supabase/types';

export type ChakraActivated = number[] | Json | null | undefined;

export function normalizeChakraData(chakras: ChakraActivated): number[] {
  if (!chakras) return [];
  
  if (Array.isArray(chakras)) {
    return chakras as number[];
  }
  
  if (typeof chakras === 'string') {
    try {
      const parsed = JSON.parse(chakras);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  
  return [];
}
