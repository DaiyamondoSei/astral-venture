
/**
 * User Performance Tracker
 * 
 * This module tracks user performance metrics, which are distinct from application performance.
 * User performance relates to user proficiency, engagement, and progress in the app's activities.
 */

import { supabase } from '@/lib/supabaseClient';

export interface UserActivityMetric {
  activity_type: string;
  completion_time?: number;
  completion_rate?: number;
  accuracy?: number;
  engagement_score?: number;
  proficiency_level?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface UserProgressMetric {
  category: string;
  progress_value: number;
  milestone_reached?: boolean;
  milestone_name?: string;
  timestamp: number;
}

export interface UserEngagementMetric {
  session_duration: number;
  interaction_count: number;
  feature_usage: Record<string, number>;
  timestamp: number;
}

/**
 * Class for tracking various aspects of user performance
 */
export class UserPerformanceTracker {
  private userId: string | null = null;
  private sessionId: string = this.generateSessionId();
  private sessionStartTime: number = Date.now();
  private lastInteractionTime: number = Date.now();
  private interactionCount: number = 0;
  private featureUsage: Record<string, number> = {};
  
  /**
   * Initialize with the current user ID
   */
  async initialize(): Promise<void> {
    const { data } = await supabase.auth.getUser();
    this.userId = data.user?.id || null;
  }
  
  /**
   * Track completion of a user activity
   */
  async trackActivityCompletion(metric: UserActivityMetric): Promise<void> {
    if (!this.userId) await this.initialize();
    
    try {
      // Update interaction tracking
      this.interactionCount++;
      this.lastInteractionTime = Date.now();
      
      // Update feature usage
      const activityType = metric.activity_type;
      this.featureUsage[activityType] = (this.featureUsage[activityType] || 0) + 1;
      
      // Record to database
      if (this.userId) {
        await supabase.from('user_activities').insert({
          user_id: this.userId,
          activity_type: metric.activity_type,
          completion_rate: metric.completion_rate,
          duration: metric.completion_time,
          timestamp: new Date(metric.timestamp).toISOString(),
          metadata: metric.metadata
        });
      }
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }
  
  /**
   * Track user progress in a specific category
   */
  async trackProgress(metric: UserProgressMetric): Promise<void> {
    if (!this.userId) await this.initialize();
    
    try {
      if (this.userId) {
        await supabase.from('user_progress').insert({
          user_id: this.userId,
          category: metric.category,
          completion_value: metric.progress_value,
          milestone_reached: metric.milestone_reached,
          milestone_name: metric.milestone_name,
          completed_at: new Date(metric.timestamp).toISOString()
        });
      }
    } catch (error) {
      console.error('Error tracking user progress:', error);
    }
  }
  
  /**
   * Track user engagement metrics
   */
  async trackEngagement(metric?: Partial<UserEngagementMetric>): Promise<void> {
    if (!this.userId) await this.initialize();
    
    try {
      const currentTime = Date.now();
      const sessionDuration = currentTime - this.sessionStartTime;
      
      const engagementMetric: UserEngagementMetric = {
        session_duration: metric?.session_duration || sessionDuration,
        interaction_count: metric?.interaction_count || this.interactionCount,
        feature_usage: metric?.feature_usage || this.featureUsage,
        timestamp: currentTime
      };
      
      if (this.userId) {
        // Update user_energy_interactions table
        await supabase.from('user_energy_interactions').upsert({
          user_id: this.userId,
          interaction_count: engagementMetric.interaction_count,
          last_interaction_time: new Date(engagementMetric.timestamp).toISOString(),
          // Calculate resonance level and portal energy based on engagement
          resonance_level: Math.min(10, Math.ceil(engagementMetric.interaction_count / 10)),
          portal_energy: Math.min(100, engagementMetric.session_duration / 60000 * 5) // 5 points per minute
        }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Error tracking user engagement:', error);
    }
  }
  
  /**
   * Track a chakra activation event
   */
  async trackChakraActivation(chakraId: number, activationLevel: number): Promise<void> {
    if (!this.userId) await this.initialize();
    
    try {
      if (this.userId) {
        // Get current chakra system
        const { data: chakraSystem } = await supabase
          .from('chakra_systems')
          .select('*')
          .eq('user_id', this.userId)
          .single();
        
        if (chakraSystem) {
          // Update the chakra system with new activation
          const chakras = chakraSystem.chakras || {};
          chakras[`chakra_${chakraId}`] = {
            ...(chakras[`chakra_${chakraId}`] || {}),
            activation_level: activationLevel,
            last_activated: new Date().toISOString()
          };
          
          // Calculate overall balance based on all chakras
          const chakraIds = [1, 2, 3, 4, 5, 6, 7];
          let totalActivation = 0;
          let activatedCount = 0;
          let highestChakraId = 0;
          let highestActivation = 0;
          
          chakraIds.forEach(id => {
            const chakra = chakras[`chakra_${id}`];
            if (chakra && chakra.activation_level > 0) {
              totalActivation += chakra.activation_level;
              activatedCount++;
              
              if (chakra.activation_level > highestActivation) {
                highestActivation = chakra.activation_level;
                highestChakraId = id;
              }
            }
          });
          
          const overallBalance = activatedCount > 0 
            ? Math.round((totalActivation / (activatedCount * 10)) * 100) 
            : 0;
          
          // Update chakra system
          await supabase
            .from('chakra_systems')
            .update({
              chakras,
              overall_balance: overallBalance,
              dominant_chakra: highestChakraId > 0 ? `chakra_${highestChakraId}` : null,
              last_updated: new Date().toISOString()
            })
            .eq('user_id', this.userId);
        } else {
          // Create new chakra system for user
          const chakras: Record<string, any> = {};
          chakras[`chakra_${chakraId}`] = {
            activation_level: activationLevel,
            last_activated: new Date().toISOString()
          };
          
          await supabase
            .from('chakra_systems')
            .insert({
              user_id: this.userId,
              chakras,
              overall_balance: 10, // Initial value
              dominant_chakra: `chakra_${chakraId}`
            });
        }
      }
    } catch (error) {
      console.error('Error tracking chakra activation:', error);
    }
  }
  
  /**
   * Add energy points for user activity
   */
  async addEnergyPoints(points: number, source: string): Promise<number> {
    if (!this.userId) await this.initialize();
    
    try {
      if (this.userId) {
        // Use the RPC function to increment points
        const { data, error } = await supabase
          .rpc('increment_points', {
            row_id: this.userId,
            points_to_add: points
          });
          
        if (error) {
          console.error('Error adding energy points:', error);
          return 0;
        }
        
        // Record the points history
        await supabase
          .from('energy_points_history')
          .insert({
            user_id: this.userId,
            points_added: points,
            new_total: data,
            source
          });
          
        return data;
      }
    } catch (error) {
      console.error('Error adding energy points:', error);
    }
    
    return 0;
  }
  
  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export a singleton instance
export const userPerformanceTracker = new UserPerformanceTracker();
export default userPerformanceTracker;
