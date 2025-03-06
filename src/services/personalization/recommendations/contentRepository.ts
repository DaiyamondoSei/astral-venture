
import { ContentRecommendation } from '../types';

// Mock content items
const mockContentItems: Partial<ContentRecommendation>[] = [
  {
    id: "content1",
    title: "Beginner's Guide to Meditation",
    type: "practice",
    category: "meditation",
    relevanceScore: 85,
    chakraAlignment: [3, 4],
    recommendationReason: "Matches your selected practice types"
  },
  {
    id: "content2",
    title: "Heart Chakra Activation",
    type: "meditation",
    category: "chakras",
    relevanceScore: 90,
    chakraAlignment: [3],
    recommendationReason: "Aligns with your chakra focus"
  },
  {
    id: "content3",
    title: "Daily Reflection Practice",
    type: "reflection",
    category: "reflection",
    relevanceScore: 75,
    emotionalResonance: ["peace", "clarity"],
    recommendationReason: "Based on your reflection history"
  },
  {
    id: "content4",
    title: "Breathing Techniques for Beginners",
    type: "practice",
    category: "breathing",
    relevanceScore: 80,
    chakraAlignment: [4, 5],
    recommendationReason: "Matches your content level"
  },
  {
    id: "content5",
    title: "Understanding Energy Flow",
    type: "lesson",
    category: "chakras",
    relevanceScore: 70,
    chakraAlignment: [1, 2, 3, 4, 5, 6, 7],
    recommendationReason: "Recommended for all chakra work"
  }
];

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
      
      // Filter mock content by categories
      const filteredContent = mockContentItems
        .filter(item => categories.includes(item.category || ""))
        .map(item => ({
          id: item.id || `content_${Math.random().toString(36).substring(2, 9)}`,
          title: item.title || "Untitled Content",
          type: item.type || "lesson",
          category: item.category || "general",
          relevanceScore: item.relevanceScore || 50,
          chakraAlignment: item.chakraAlignment,
          emotionalResonance: item.emotionalResonance,
          recommendationReason: item.recommendationReason || "Recommended for you"
        }))
        .slice(0, limit);
      
      return filteredContent as ContentRecommendation[];
    } catch (error) {
      console.error('Error getting content by categories:', error);
      return [];
    }
  },
  
  /**
   * Get content by ID
   */
  async getContentById(id: string): Promise<ContentRecommendation | null> {
    console.log(`Getting content with ID: ${id}`);
    
    // Find content by ID
    const content = mockContentItems.find(item => item.id === id);
    
    if (!content) {
      return null;
    }
    
    return {
      id: content.id || `content_${Math.random().toString(36).substring(2, 9)}`,
      title: content.title || "Untitled Content",
      type: content.type || "lesson",
      category: content.category || "general",
      relevanceScore: content.relevanceScore || 50,
      chakraAlignment: content.chakraAlignment,
      emotionalResonance: content.emotionalResonance,
      recommendationReason: content.recommendationReason || "Recommended for you"
    };
  },
  
  /**
   * Get all available content
   */
  async getAllContent(limit = 20): Promise<ContentRecommendation[]> {
    console.log(`Getting all content, limit: ${limit}`);
    
    // Map mock content to proper ContentRecommendation objects
    return mockContentItems
      .map(item => ({
        id: item.id || `content_${Math.random().toString(36).substring(2, 9)}`,
        title: item.title || "Untitled Content",
        type: item.type || "lesson",
        category: item.category || "general",
        relevanceScore: item.relevanceScore || 50,
        chakraAlignment: item.chakraAlignment,
        emotionalResonance: item.emotionalResonance,
        recommendationReason: item.recommendationReason || "Recommended for you"
      }))
      .slice(0, limit) as ContentRecommendation[];
  }
};
