
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  divineCoreService, 
  DivineCoreRequest, 
  DivineCoreResponse, 
  UserContext 
} from '@/services/ai/divineCoreService';
import { useToast } from '@/hooks/use-toast';

interface UseDivineIntelligenceProps {
  intentType?: 'guidance' | 'reflection' | 'practice' | 'insight' | 'chakra' | 'general';
}

export function useDivineIntelligence(props?: UseDivineIntelligenceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<DivineCoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<UserContext | null>(null);

  // Fetch user context from Supabase
  const fetchUserContext = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('astral_level, energy_points')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Get recent reflections
      const { data: reflections, error: reflectionsError } = await supabase
        .from('energy_reflections')
        .select('content, dominant_emotion, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (reflectionsError) throw reflectionsError;
      
      // Get chakra system
      const { data: chakraSystem, error: chakraError } = await supabase
        .from('chakra_systems')
        .select('chakras, dominant_chakra')
        .eq('user_id', user.id)
        .single();
        
      // Build the context object
      const context: UserContext = {
        userId: user.id,
        astralLevel: profile?.astral_level || 1,
        energyPoints: profile?.energy_points || 0,
        recentReflections: reflections?.map(r => r.content) || [],
        emotionalState: reflections?.map(r => r.dominant_emotion).filter(Boolean) || [],
        lastInteraction: new Date()
      };
      
      if (chakraSystem && chakraSystem.chakras) {
        context.chakraBalance = typeof chakraSystem.chakras === 'object' 
          ? chakraSystem.chakras as Record<string, number>
          : {};
      }
      
      setUserContext(context);
      return context;
    } catch (err) {
      console.error('Error fetching user context:', err);
      // Return basic context if error occurs
      const basicContext: UserContext = {
        userId: user.id,
        astralLevel: 1,
        energyPoints: 0,
        lastInteraction: new Date()
      };
      setUserContext(basicContext);
      return basicContext;
    }
  }, [user]);

  // Initialize by fetching user context
  useEffect(() => {
    if (user?.id) {
      fetchUserContext();
    }
  }, [user, fetchUserContext]);

  // Process a query through the Divine Intelligence system
  const processQuery = async (message: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Refresh context or use existing
      const context = await fetchUserContext() || userContext;
      
      if (!context) {
        throw new Error("User context couldn't be established");
      }
      
      // Prepare request
      const request: DivineCoreRequest = {
        message,
        context,
        intentType: props?.intentType || 'general'
      };
      
      // Process through divine core service
      const result = await divineCoreService.processQuery(request);
      setResponse(result);
      
      // Track this interaction in the database
      if (user?.id) {
        await supabase.functions.invoke('track-activity', {
          body: {
            userId: user.id,
            activityType: 'ai_guidance',
            metadata: {
              message,
              intentType: request.intentType,
              responseType: result.personalizedLevel
            }
          }
        });
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error processing your request';
      setError(errorMessage);
      
      toast({
        title: "Cosmic Disruption",
        description: "The quantum field is currently recalibrating. Please try again.",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processQuery,
    isProcessing,
    response,
    error,
    userContext,
    refreshContext: fetchUserContext
  };
}
