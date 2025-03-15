
/**
 * Supabase Client Singleton
 * 
 * This module provides a true singleton implementation of the Supabase client
 * that prevents multiple instances from being created.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Private instance variable with Symbol to prevent external access
const instanceSymbol = Symbol('supabaseInstance');

// Private class properties
interface PrivateProperties {
  [instanceSymbol]: SupabaseClient | null;
  hasShownConfigWarning: boolean;
}

/**
 * Singleton class for Supabase client
 */
class SupabaseClientSingleton {
  private static instance: SupabaseClientSingleton;
  private properties: PrivateProperties = {
    [instanceSymbol]: null,
    hasShownConfigWarning: false
  };

  private constructor() {
    // Private constructor prevents direct instantiation
    console.log('SupabaseClientSingleton initialized');
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SupabaseClientSingleton {
    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = new SupabaseClientSingleton();
    }
    
    return SupabaseClientSingleton.instance;
  }

  /**
   * Get environment configuration with fallbacks
   */
  private getEnvironmentConfig(): { supabaseUrl: string; supabaseAnonKey: string } {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase configuration missing or incomplete');
      
      // Show a toast only once to avoid spamming the user
      if (!this.properties.hasShownConfigWarning && typeof document !== 'undefined') {
        toast.warning('Missing Supabase configuration', {
          description: 'Some features may not work as expected',
          duration: 5000,
        });
        this.properties.hasShownConfigWarning = true;
      }
    }

    return { supabaseUrl, supabaseAnonKey };
  }

  /**
   * Get the Supabase client instance
   */
  public getClient(): SupabaseClient {
    if (!this.properties[instanceSymbol]) {
      const { supabaseUrl, supabaseAnonKey } = this.getEnvironmentConfig();
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing. Please check your environment variables.');
      }
      
      // Create a new client with the configuration
      this.properties[instanceSymbol] = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      });

      console.log('Supabase client instance created');
    }

    return this.properties[instanceSymbol]!;
  }

  /**
   * Reset the client (mainly for testing)
   */
  public resetClient(): void {
    this.properties[instanceSymbol] = null;
    console.log('Supabase client instance reset');
  }

  /**
   * Check if configuration is valid
   */
  public isConfigValid(): boolean {
    const { supabaseUrl, supabaseAnonKey } = this.getEnvironmentConfig();
    return !!supabaseUrl && !!supabaseAnonKey;
  }

  /**
   * Get configuration status
   */
  public getConfigurationStatus(): { 
    isValid: boolean; 
    errors: string[] | null; 
    isComplete: boolean;
  } {
    const { supabaseUrl, supabaseAnonKey } = this.getEnvironmentConfig();
    
    const errors = [];
    if (!supabaseUrl) errors.push('Missing required configuration: VITE_SUPABASE_URL');
    if (!supabaseAnonKey) errors.push('Missing required configuration: VITE_SUPABASE_ANON_KEY');
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : null,
      isComplete: errors.length === 0
    };
  }
}

// Export the singleton instance's getClient method
export const supabaseClientSingleton = SupabaseClientSingleton.getInstance();
export const supabase = supabaseClientSingleton.getClient();

// Export configuration helpers
export function isSupabaseConfigValid(): boolean {
  return supabaseClientSingleton.isConfigValid();
}

export function getConfigurationStatus(): { 
  isValid: boolean; 
  errors: string[] | null; 
  isComplete: boolean;
} {
  return supabaseClientSingleton.getConfigurationStatus();
}

// Export as default as well for flexibility
export default supabase;
