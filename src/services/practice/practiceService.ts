
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  mapDbPracticesToPractices, 
  mapDbPracticeToPractice, 
  mapDbCompletionsToCompletions 
} from './practiceMappers';

export interface Practice {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'meditation' | 'quantum-task' | 'integration';
  category: 'beginner' | 'intermediate' | 'advanced';
  energyPoints: number;
  chakraAssociation?: string[];
  level: number;
  instructions?: string[];
}

export interface PracticeCompletion {
  id: string;
  userId: string;
  practiceId: string;
  completedAt: string;
  duration: number;
  energyPointsEarned: number;
  reflection?: string;
  chakrasActivated?: string[];
}

export interface PracticeProgress {
  totalCompleted: number;
  streakCount: number;
  favoriteType: string;
  lastCompletedAt: string | null;
  completedToday: boolean;
}

/**
 * Fetch practices based on user level and filters
 */
export async function fetchPractices(
  level: number = 1,
  type?: string,
  category?: string
): Promise<Practice[]> {
  try {
    let query = supabase
      .from('practices')
      .select('*')
      .lte('level', level)
      .order('level', { ascending: true });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching practices:', error);
      return [];
    }
    
    return mapDbPracticesToPractices(data || []);
  } catch (error) {
    console.error('Error in fetchPractices:', error);
    return [];
  }
}

/**
 * Fetch practice by ID
 */
export async function fetchPracticeById(id: string): Promise<Practice | null> {
  try {
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching practice:', error);
      return null;
    }
    
    return mapDbPracticeToPractice(data);
  } catch (error) {
    console.error('Error in fetchPracticeById:', error);
    return null;
  }
}

/**
 * Record a completed practice
 */
export async function recordPracticeCompletion(
  userId: string,
  practiceId: string,
  duration: number,
  reflection?: string
): Promise<boolean> {
  try {
    // Use the dedicated edge function to process completions
    const { data, error } = await supabase.functions.invoke('track-practice-completion', {
      body: {
        userId,
        practiceId,
        duration,
        reflection
      }
    });
    
    if (error) {
      console.error('Error recording practice completion:', error);
      toast({
        title: 'Error recording practice',
        description: 'Your practice was not recorded. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
    
    toast({
      title: 'Practice Completed!',
      description: `You earned ${data.energyPointsEarned} energy points.`,
      variant: 'default'
    });
    
    return true;
  } catch (error) {
    console.error('Error in recordPracticeCompletion:', error);
    return false;
  }
}

/**
 * Fetch user practice progress
 */
export async function fetchPracticeProgress(userId: string): Promise<PracticeProgress | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-practice-progress', {
      body: { userId }
    });
    
    if (error) {
      console.error('Error fetching practice progress:', error);
      return null;
    }
    
    return data as PracticeProgress;
  } catch (error) {
    console.error('Error in fetchPracticeProgress:', error);
    return null;
  }
}

/**
 * Fetch user's completed practices
 */
export async function fetchCompletedPractices(userId: string): Promise<PracticeCompletion[]> {
  try {
    const { data, error } = await supabase
      .from('practice_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching completed practices:', error);
      return [];
    }
    
    return mapDbCompletionsToCompletions(data || []);
  } catch (error) {
    console.error('Error in fetchCompletedPractices:', error);
    return [];
  }
}
