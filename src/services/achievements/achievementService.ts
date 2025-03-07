
import { AchievementEventType } from '@/components/onboarding/hooks/achievement/types';

/**
 * Service to track and manage achievement events
 */
export class AchievementService {
  private userId: string | undefined;
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();
  
  constructor(userId?: string) {
    this.userId = userId;
  }
  
  /**
   * Set the user ID for this service instance
   */
  setUserId(userId: string) {
    this.userId = userId;
  }
  
  /**
   * Track an achievement event
   * @param eventType The type of achievement event
   * @param data Optional data related to the event
   */
  trackEvent(eventType: AchievementEventType, data: any = {}) {
    if (!this.userId) {
      console.warn('Achievement event tracked without userId');
    }
    
    const eventData = {
      eventType,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    // Log the event
    console.log(`Achievement event tracked: ${eventType}`, eventData);
    
    // Store event in local storage for persistence
    this.storeEvent(eventData);
    
    // Notify listeners
    this.notifyListeners(eventType, eventData);
    
    return eventData;
  }
  
  /**
   * Store event in local storage
   */
  private storeEvent(eventData: any) {
    if (!this.userId) return;
    
    try {
      const eventsKey = `achievement-events-${this.userId}`;
      const storedEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
      storedEvents.push(eventData);
      
      // Limit stored events to prevent excessive storage use
      const limitedEvents = storedEvents.slice(-100);
      localStorage.setItem(eventsKey, JSON.stringify(limitedEvents));
    } catch (error) {
      console.error('Error storing achievement event:', error);
    }
  }
  
  /**
   * Add an event listener
   * @param eventType The event type to listen for, or '*' for all events
   * @param callback Function to call when the event occurs
   */
  addEventListener(eventType: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)?.push(callback);
    
    return () => this.removeEventListener(eventType, callback);
  }
  
  /**
   * Remove an event listener
   */
  removeEventListener(eventType: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(eventType);
    if (!listeners) return;
    
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all listeners of an event
   */
  private notifyListeners(eventType: string, data: any) {
    // Notify specific event listeners
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in achievement event listener:', error);
      }
    });
    
    // Notify wildcard listeners
    const wildcardListeners = this.eventListeners.get('*') || [];
    wildcardListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in wildcard achievement event listener:', error);
      }
    });
  }
  
  /**
   * Get achievement history from local storage
   */
  getAchievementHistory(): Record<string, any> {
    if (!this.userId) return {};
    
    try {
      const historyKey = `achievements-${this.userId}`;
      return JSON.parse(localStorage.getItem(historyKey) || '{}');
    } catch (error) {
      console.error('Error retrieving achievement history:', error);
      return {};
    }
  }
  
  /**
   * Clear all achievement data for testing purposes
   * @param confirm Confirmation string to prevent accidental clearing
   */
  clearAllData(confirm: string) {
    if (confirm !== 'CLEAR_ACHIEVEMENTS_DATA' || !this.userId) return;
    
    try {
      localStorage.removeItem(`achievements-${this.userId}`);
      localStorage.removeItem(`achievement-events-${this.userId}`);
      console.log('Achievement data cleared');
    } catch (error) {
      console.error('Error clearing achievement data:', error);
    }
  }
}

// Create a singleton instance for global use
export const achievementService = new AchievementService();

export default achievementService;
