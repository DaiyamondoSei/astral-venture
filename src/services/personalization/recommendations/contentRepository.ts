
import { supabase } from '@/integrations/supabase/client';
import { ContentRecommendation } from '../types';

// Sample mock content items to seed the database if empty
const mockContentItems: Partial<ContentRecommendation>[] = [
  {
    title: "Beginner's Guide to Meditation",
    type: "practice",
    category: "meditation",
    relevanceScore: 85,
    chakraAlignment: [3, 4],
    recommendationReason: "Matches your selected practice types"
  },
  {
    title: "Heart Chakra Activation",
    type: "meditation",
    category: "chakras",
    relevanceScore: 90,
    chakraAlignment: [3],
    recommendationReason: "Aligns with your chakra focus"
  },
  {
    title: "Daily Reflection Practice",
    type: "reflection",
    category: "reflection",
    relevanceScore: 75,
    emotionalResonance: ["peace", "clarity"],
    recommendationReason: "Based on your reflection history"
  },
  {
    title: "Breathing Techniques for Beginners",
    type: "practice",
    category: "breathing",
    relevanceScore: 80,
    chakraAlignment: [4, 5],
    recommendationReason: "Matches your content level"
  },
  {
    title: "Understanding Energy Flow",
    type: "lesson",
    category: "chakras",
    relevanceScore: 70,
    chakraAlignment: [1, 2, 3, 4, 5, 6, 7],
    recommendationReason: "Recommended for all chakra work"
  }
];

// Helper function to ensure the database has some content
async function ensureContentExists() {
  // Check if content exists
  const { data, error } = await supabase
    .from('content_library')
    .select('id')
    .limit(1);
    
  if (error) {
    console.error('Error checking for content:', error);
    return;
  }
  
  // If no content exists, seed with mock data
  if (data.length === 0) {
    console.log('Seeding content library with initial data');
    
    const contentToInsert = mockContentItems.map(item => ({
      title: item.title || 'Untitled Content',
      type: item.type || 'lesson',
      category: item.category || 'general',
      relevance_score: item.relevanceScore || 50,
      chakra_alignment: item.chakraAlignment || null,
      emotional_resonance: item.emotionalResonance || null,
      recommendation_reason: item.recommendationReason || 'Recommended for you'
    }));
    
    const { error: insertError } = await supabase
      .from('content_library')
      .insert(contentToInsert);
      
    if (insertError) {
      console.error('Error seeding content library:', insertError);
    }
  }
}

/**
 * Repository for content library data
 */
export const contentRepository = {
  /**
   * Get content by categories
   */
  async getContentByCategories(
    categories: string[],
    limit = 10
  ): Promise<ContentRecommendation[]> {
    try {
      console.log(`Getting content for categories: ${categories.join(', ')}`);
      
      // Ensure we have some content in the database
      await ensureContentExists();
      
      // Filter content by categories
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .in('category', categories)
        .limit(limit);
        
      if (error) {
        throw error;
      }
      
      // Map database records to ContentRecommendation type
      return data.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        category: item.category,
        relevanceScore: item.relevance_score,
        chakraAlignment: item.chakra_alignment,
        emotionalResonance: item.emotional_resonance,
        recommendationReason: item.recommendation_reason
      }));
    } catch (error) {
      console.error('Error getting content by categories:', error);
      return [];
    }
  },
  
  /**
   * Get content by ID
   */
  async getContentById(id: string): Promise<ContentRecommendation | null> {
    try {
      console.log(`Getting content with ID: ${id}`);
      
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        return null;
      }
      
      return {
        id: data.id,
        title: data.title,
        type: data.type,
        category: data.category,
        relevanceScore: data.relevance_score,
        chakraAlignment: data.chakra_alignment,
        emotionalResonance: data.emotional_resonance,
        recommendationReason: data.recommendation_reason
      };
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      return null;
    }
  },
  
  /**
   * Get all available content
   */
  async getAllContent(limit = 20): Promise<ContentRecommendation[]> {
    try {
      console.log(`Getting all content, limit: ${limit}`);
      
      // Ensure we have some content in the database
      await ensureContentExists();
      
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .limit(limit);
        
      if (error) {
        throw error;
      }
      
      // Map database records to ContentRecommendation type
      return data.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        category: item.category,
        relevanceScore: item.relevance_score,
        chakraAlignment: item.chakra_alignment,
        emotionalResonance: item.emotional_resonance,
        recommendationReason: item.recommendation_reason
      }));
    } catch (error) {
      console.error('Error getting all content:', error);
      return [];
    }
  }
};
