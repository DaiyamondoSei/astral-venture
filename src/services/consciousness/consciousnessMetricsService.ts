import { supabase } from '@/integrations/supabase/client';
import type { ConsciousnessMetrics, ConsciousnessLevel, ConsciousnessProgress, ChakraType } from '@/types/consciousness';

/**
 * Service for managing consciousness metrics data
 */
export const consciousnessMetricsService = {
  /**
   * Get user's consciousness metrics
   */
  async getUserMetrics(userId: string): Promise<ConsciousnessMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('consciousness_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        userId: data.user_id,
        level: data.level as ConsciousnessLevel,
        awarenessScore: data.awareness_score,
        expansionRate: data.expansion_rate,
        insightDepth: data.insight_depth,
        reflectionQuality: data.reflection_quality,
        meditationConsistency: data.meditation_consistency,
        energyClarity: data.energy_clarity,
        chakraBalance: data.chakra_balance,
        lastAssessment: data.last_assessment,
        history: data.history ? data.history as ConsciousnessMetrics['history'] : []
      };
    } catch (error) {
      console.error('Error fetching consciousness metrics:', error);
      return null;
    }
  },
  
  /**
   * Update user's consciousness metrics
   */
  async updateMetrics(metrics: Partial<ConsciousnessMetrics>): Promise<boolean> {
    try {
      if (!metrics.userId) throw new Error('User ID is required');
      
      const { error } = await supabase
        .from('consciousness_metrics')
        .upsert({
          user_id: metrics.userId,
          level: metrics.level,
          awareness_score: metrics.awarenessScore,
          expansion_rate: metrics.expansionRate,
          insight_depth: metrics.insightDepth,
          reflection_quality: metrics.reflectionQuality,
          meditation_consistency: metrics.meditationConsistency,
          energy_clarity: metrics.energyClarity,
          chakra_balance: metrics.chakraBalance,
          last_assessment: metrics.lastAssessment || new Date().toISOString(),
          history: metrics.history as any
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating consciousness metrics:', error);
      return false;
    }
  },
  
  /**
   * Calculate user's consciousness level based on various metrics
   */
  calculateConsciousnessLevel(metrics: Partial<ConsciousnessMetrics>): ConsciousnessLevel {
    // Simple calculation based on awareness score
    const awarenessScore = metrics.awarenessScore || 0;
    
    if (awarenessScore >= 90) return 'unified';
    if (awarenessScore >= 80) return 'cosmically_aware';
    if (awarenessScore >= 70) return 'illuminated';
    if (awarenessScore >= 60) return 'transcending';
    if (awarenessScore >= 50) return 'expanding';
    if (awarenessScore >= 30) return 'aware';
    return 'awakening';
  },
  
  /**
   * Get user's consciousness progress
   */
  async getUserProgress(userId: string): Promise<ConsciousnessProgress | null> {
    try {
      // First get the metrics
      const metrics = await this.getUserMetrics(userId);
      if (!metrics) return null;
      
      // Get chakra system
      const { data: chakraData, error: chakraError } = await supabase
        .from('chakra_systems')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (chakraError) throw chakraError;
      
      // Get user profile for energy points
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('energy_points, astral_level')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Calculate dream recall percentage from recent dreams
      const { data: dreamData, error: dreamError } = await supabase
        .from('energy_reflections')
        .select('id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (dreamError) throw dreamError;
      
      const dreamRecallPercentage = dreamData ? Math.min(100, (dreamData.length / 30) * 100) : 0;
      
      const chakraSystemData = {
        chakras: chakraData?.chakras as Record<string, any> || {},
        overallBalance: chakraData?.overall_balance || 0,
        dominantChakra: chakraData?.dominant_chakra as ChakraType || null,
        lastUpdated: chakraData?.last_updated || new Date().toISOString()
      };
      
      return {
        userId,
        currentLevel: metrics.level,
        currentState: 'active', // Default state
        energyPoints: profileData?.energy_points || 0,
        meditationMinutes: 0, // We would calculate this from session data
        reflectionCount: dreamData?.length || 0,
        dreamRecallPercentage,
        chakraSystem: chakraSystemData,
        nextMilestone: {
          description: 'Deepen your meditation practice',
          pointsNeeded: 100,
          estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        insights: [],
        recommendations: []
      };
    } catch (error) {
      console.error('Error fetching consciousness progress:', error);
      return null;
    }
  }
};
