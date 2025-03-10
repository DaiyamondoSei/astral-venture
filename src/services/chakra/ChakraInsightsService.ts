
import { supabase } from '@/integrations/supabase/client';
import { handleError, ErrorCategory, ErrorSeverity } from '@/utils/errorHandling';
import type { ChakraInsight, ChakraInsightsOptions } from '@/hooks/useChakraInsights';

class ChakraInsightsService {
  /**
   * Fetch the user's chakra insights from recent reflections
   * 
   * @param options - Filtering and configuration options
   * @returns Array of chakra insights
   */
  async getUserChakraInsights(options: ChakraInsightsOptions = {}): Promise<ChakraInsight[]> {
    try {
      const { data: reflections, error } = await supabase
        .from('energy_reflections')
        .select(`
          id,
          content,
          chakra_analysis,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(options.limit || 10);

      if (error) throw error;

      if (!reflections || reflections.length === 0) {
        return [];
      }

      // Process the reflections to extract chakra insights
      const insights: ChakraInsight[] = [];
      
      // Process each reflection's chakra_analysis to create ChakraInsight objects
      reflections.forEach(reflection => {
        if (!reflection.chakra_analysis) return;
        
        try {
          const chakraAnalysis = typeof reflection.chakra_analysis === 'string' 
            ? JSON.parse(reflection.chakra_analysis) 
            : reflection.chakra_analysis;
            
          // Map the chakra analysis to ChakraInsight objects
          Object.entries(chakraAnalysis).forEach(([chakraType, data]) => {
            if (!data) return;
            
            const chakraData = data as any;
            const affinity = chakraData.affinity || 0;
            
            // Skip if below minimum affinity threshold (if specified)
            if (options.minAffinity !== undefined && affinity < options.minAffinity) {
              return;
            }
            
            // Skip if not in the specified chakra types (if specified)
            if (options.chakraTypes && options.chakraTypes.length > 0 && 
                !options.chakraTypes.includes(chakraType)) {
              return;
            }
            
            insights.push({
              id: `${reflection.id}-${chakraType}`,
              chakraType,
              status: chakraData.status || 'balanced',
              insights: chakraData.insights || [],
              recommendations: options.includeRecommendations ? (chakraData.recommendations || []) : [],
              affinity
            });
          });
        } catch (err) {
          handleError(err, {
            category: ErrorCategory.DATA_PROCESSING,
            severity: ErrorSeverity.WARNING,
            context: 'Chakra analysis processing',
          });
        }
      });

      return insights;
    } catch (error) {
      handleError(error, {
        category: ErrorCategory.DATA_PROCESSING,
        severity: ErrorSeverity.ERROR,
        context: 'Chakra insights service',
      });
      throw error;
    }
  }
}

export const chakraInsightsService = new ChakraInsightsService();
export default chakraInsightsService;
