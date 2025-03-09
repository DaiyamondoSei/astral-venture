
import { supabase } from '@/integrations/supabase/client';
import { DreamRecord, ChakraType } from '@/types/consciousness';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing dream records and analysis
 */
export const dreamService = {
  /**
   * Save a new dream record
   */
  async saveDream(dream: Omit<DreamRecord, 'id'>): Promise<DreamRecord | null> {
    try {
      const dreamId = uuidv4();
      const { error } = await supabase
        .from('dreams')
        .insert({
          id: dreamId,
          user_id: dream.userId,
          date: dream.date || new Date().toISOString(),
          content: dream.content,
          lucidity: dream.lucidity || 0,
          emotional_tone: dream.emotionalTone || [],
          symbols: dream.symbols || [],
          chakras_activated: dream.chakrasActivated || [],
          consciousness_depth: dream.consciousness?.depth || 0,
          consciousness_insights: dream.consciousness?.insights || [],
          consciousness_archetypes: dream.consciousness?.archetypes || [],
          analysis_theme: dream.analysis?.theme || '',
          analysis_interpretation: dream.analysis?.interpretation || '',
          analysis_guidance: dream.analysis?.guidance || '',
          tags: dream.tags || []
        });
      
      if (error) throw error;
      
      // Return the saved dream with the new ID
      return {
        ...dream,
        id: dreamId
      };
    } catch (error) {
      console.error('Error saving dream:', error);
      return null;
    }
  },
  
  /**
   * Get a specific dream record by ID
   */
  async getDream(dreamId: string): Promise<DreamRecord | null> {
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('id', dreamId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return this.mapDreamRecord(data);
    } catch (error) {
      console.error('Error fetching dream:', error);
      return null;
    }
  },
  
  /**
   * Get all dreams for a user
   */
  async getUserDreams(userId: string, limit = 10): Promise<DreamRecord[]> {
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data ? data.map(this.mapDreamRecord) : [];
    } catch (error) {
      console.error('Error fetching user dreams:', error);
      return [];
    }
  },
  
  /**
   * Update existing dream record
   */
  async updateDream(dreamId: string, updates: Partial<DreamRecord>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('dreams')
        .update({
          content: updates.content,
          lucidity: updates.lucidity,
          emotional_tone: updates.emotionalTone,
          symbols: updates.symbols,
          chakras_activated: updates.chakrasActivated,
          consciousness_depth: updates.consciousness?.depth,
          consciousness_insights: updates.consciousness?.insights,
          consciousness_archetypes: updates.consciousness?.archetypes,
          analysis_theme: updates.analysis?.theme,
          analysis_interpretation: updates.analysis?.interpretation,
          analysis_guidance: updates.analysis?.guidance,
          tags: updates.tags
        })
        .eq('id', dreamId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating dream:', error);
      return false;
    }
  },
  
  /**
   * Analyze dream content to extract themes, emotions, and chakra activations
   */
  analyzeDreamContent(content: string): {
    emotionalTone: string[];
    symbols: string[];
    chakrasActivated: ChakraType[];
    theme: string;
  } {
    // This would ideally be connected to an AI service for deep analysis
    // For now, we'll implement a simplified pattern-matching approach
    
    const emotions: { [key: string]: string } = {
      joy: 'happy|joy|delight|excited|ecstatic',
      fear: 'afraid|scared|anxious|terror|dread',
      sadness: 'sad|grief|sorrow|depressed|melancholy',
      anger: 'angry|rage|furious|irritated|mad',
      peace: 'calm|serene|peaceful|tranquil|harmony',
      confusion: 'confused|lost|uncertain|bewildered|perplexed',
      wonder: 'awe|amazed|wonder|curious|fascinated'
    };
    
    const chakraKeywords: { [key in ChakraType]: string } = {
      root: 'survival|security|stability|grounded|home|family|basic needs',
      sacral: 'creativity|passion|pleasure|emotion|desire|sexuality|water',
      solar: 'confidence|power|control|will|transformation|fire|energy',
      heart: 'love|compassion|healing|balance|relationship|air|acceptance',
      throat: 'expression|truth|communication|voice|speaking|blue|authentic',
      third: 'intuition|vision|insight|wisdom|perception|indigo|clarity',
      crown: 'consciousness|divine|spiritual|cosmic|unity|purpose|violet'
    };
    
    const symbols = [
      'water', 'fire', 'earth', 'air', 'flying', 'falling', 'running',
      'door', 'window', 'house', 'path', 'journey', 'light', 'darkness',
      'animal', 'death', 'birth', 'transformation', 'mountain', 'ocean', 
      'forest', 'city', 'stars', 'sun', 'moon'
    ];
    
    const contentLower = content.toLowerCase();
    
    // Detect emotions
    const detectedEmotions = Object.entries(emotions)
      .filter(([_, patterns]) => 
        patterns.split('|').some(pattern => contentLower.includes(pattern))
      )
      .map(([emotion]) => emotion);
    
    // Detect chakras
    const detectedChakras = Object.entries(chakraKeywords)
      .filter(([_, patterns]) => 
        patterns.split('|').some(pattern => contentLower.includes(pattern))
      )
      .map(([chakra]) => chakra as ChakraType);
    
    // Detect symbols
    const detectedSymbols = symbols.filter(symbol => 
      contentLower.includes(symbol.toLowerCase())
    );
    
    // Determine theme (simplified)
    let theme = 'Personal Growth';
    if (detectedChakras.includes('crown') || detectedChakras.includes('third')) {
      theme = 'Spiritual Awakening';
    } else if (detectedChakras.includes('heart')) {
      theme = 'Emotional Healing';
    } else if (detectedChakras.includes('solar')) {
      theme = 'Personal Power';
    } else if (detectedChakras.includes('root') || detectedChakras.includes('sacral')) {
      theme = 'Security and Creativity';
    }
    
    return {
      emotionalTone: detectedEmotions.length > 0 ? detectedEmotions : ['neutral'],
      symbols: detectedSymbols,
      chakrasActivated: detectedChakras.length > 0 ? detectedChakras : ['heart'],
      theme
    };
  },
  
  /**
   * Map database record to DreamRecord type
   */
  mapDreamRecord(data: any): DreamRecord {
    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      content: data.content,
      lucidity: data.lucidity || 0,
      emotionalTone: data.emotional_tone || [],
      symbols: data.symbols || [],
      chakrasActivated: data.chakras_activated || [],
      consciousness: {
        depth: data.consciousness_depth || 0,
        insights: data.consciousness_insights || [],
        archetypes: data.consciousness_archetypes || []
      },
      analysis: {
        theme: data.analysis_theme || '',
        interpretation: data.analysis_interpretation || '',
        guidance: data.analysis_guidance || ''
      },
      tags: data.tags || []
    };
  }
};
