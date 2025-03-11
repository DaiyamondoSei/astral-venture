
/**
 * API Example using Result and AsyncResult patterns
 * 
 * This example demonstrates how to use the Result and AsyncResult patterns
 * for robust error handling in API calls, providing type safety and
 * predictable error handling.
 */

import { supabase } from '@/lib/supabaseClient';
import { 
  Result, success, failure, isSuccess, unwrap, unwrapOr,
  asyncResultify, tryCatch
} from '../Result';
import { 
  AsyncResult, mapAsync, flatMapAsync, tapAsync, tapErrorAsync,
  withTimeout, retryAsync
} from '../AsyncResult';

// Define type-safe errors for better error handling
interface EnhancedError extends Error {
  code: string;
  context?: Record<string, unknown>;
}

// Create a utility for generating typed errors
function createApiError(
  message: string, 
  code: string, 
  context?: Record<string, unknown>
): EnhancedError {
  const error = new Error(message) as EnhancedError;
  error.code = code;
  error.context = context;
  return error;
}

// Define our API service with Result-based error handling
export class ApiService {
  /**
   * Fetches user data with robust error handling
   */
  async getUserProfile(userId: string): AsyncResult<UserProfile, EnhancedError> {
    // Basic validation before making the request
    if (!userId) {
      return failure(createApiError(
        'User ID is required', 
        'MISSING_PARAMETER',
        { parameter: 'userId' }
      ));
    }

    try {
      // Use the base Supabase client for the request
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Transform database errors to our enhanced error type
        return failure(createApiError(
          `Failed to fetch user profile: ${error.message}`,
          error.code,
          { originalError: error, userId }
        ));
      }

      if (!data) {
        return failure(createApiError(
          'User profile not found',
          'NOT_FOUND',
          { userId }
        ));
      }

      // Return successful result with typed data
      return success(data as UserProfile);
    } catch (error) {
      // Catch any unexpected errors and transform them
      return failure(createApiError(
        `Unexpected error fetching user profile: ${error instanceof Error ? error.message : String(error)}`,
        'UNEXPECTED_ERROR',
        { originalError: error, userId }
      ));
    }
  }

  /**
   * Updates user data with comprehensive error handling
   */
  async updateUserProfile(
    userId: string,
    profileData: Partial<UserProfile>
  ): AsyncResult<UserProfile, EnhancedError> {
    // Input validation
    if (!userId) {
      return failure(createApiError('User ID is required', 'MISSING_PARAMETER'));
    }

    if (!profileData || Object.keys(profileData).length === 0) {
      return failure(createApiError('No update data provided', 'INVALID_DATA'));
    }

    try {
      // Execute the update operation
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return failure(createApiError(
          `Failed to update profile: ${error.message}`,
          error.code,
          { originalError: error, userId }
        ));
      }

      return success(data as UserProfile);
    } catch (error) {
      return failure(createApiError(
        `Error updating profile: ${error instanceof Error ? error.message : String(error)}`,
        'UNEXPECTED_ERROR',
        { originalError: error, userId }
      ));
    }
  }

  /**
   * Demonstrates composition of multiple API calls with error handling
   */
  async initializeUserData(userId: string): AsyncResult<UserDataSummary, EnhancedError> {
    // First, get user profile
    const profileResult = await this.getUserProfile(userId);

    // Use flatMapAsync for composing dependent async operations
    return flatMapAsync(profileResult, async (profile) => {
      // Get preferences in parallel
      const preferencesResult = await this.getUserPreferences(userId);
      
      // Get stats in parallel
      const statsResult = await this.getUserStats(userId);

      // Combine the results
      if (isSuccess(preferencesResult) && isSuccess(statsResult)) {
        return success({
          profile,
          preferences: preferencesResult.value,
          stats: statsResult.value
        });
      } else if (!isSuccess(preferencesResult)) {
        return preferencesResult;
      } else {
        return statsResult;
      }
    });
  }

  // Additional methods using the pattern
  async getUserPreferences(userId: string): AsyncResult<UserPreferences, EnhancedError> {
    // Implementation using the same pattern
    // This is a placeholder - would follow the same robust error handling approach
    return success({ theme: 'dark', notifications: true });
  }

  async getUserStats(userId: string): AsyncResult<UserStats, EnhancedError> {
    // Implementation using the same pattern
    // This is a placeholder - would follow the same robust error handling approach
    return success({ lastActive: new Date(), loginCount: 42 });
  }
}

// Example of using AsyncResult with retries for network resilience
async function fetchWithRetry<T>(url: string): AsyncResult<T, EnhancedError> {
  return retryAsync(
    () => {
      // Make the actual API call
      return asyncResultify(async () => {
        const response = await fetch(url);
        if (!response.ok) {
          throw createApiError(
            `API request failed with status ${response.status}`,
            'API_ERROR',
            { status: response.status, url }
          );
        }
        return response.json();
      })();
    },
    {
      maxRetries: 3,
      initialDelayMs: 300,
      backoffFactor: 1.5,
      maxDelayMs: 5000,
      retryableErrors: (error) => {
        // Only retry certain errors, like network timeouts
        return error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('network'));
      }
    }
  );
}

// Example of consumer code using the API service
async function loadUserProfile(userId: string) {
  const apiService = new ApiService();
  
  // Using withTimeout to ensure we don't wait forever
  const userProfileResult = await withTimeout(
    apiService.getUserProfile(userId),
    5000, // 5 second timeout
    createApiError('Request timed out', 'TIMEOUT', { userId })
  );
  
  // Use tapAsync for side effects like logging on success
  await tapAsync(userProfileResult, (profile) => {
    console.log('Successfully loaded profile:', profile.username);
  });
  
  // Use tapErrorAsync for error logging without affecting the flow
  await tapErrorAsync(userProfileResult, (error) => {
    console.error('Error loading profile:', error.message, error.code);
  });
  
  // Safely use the result with type safety
  if (isSuccess(userProfileResult)) {
    const profile = userProfileResult.value;
    // Do something with the profile data
    return profile;
  } else {
    // Handle the error case
    const { code, message } = userProfileResult.error;
    
    // Provide appropriate fallback behavior
    if (code === 'NOT_FOUND') {
      return { username: 'Guest', astral_level: 1 };
    } else {
      throw userProfileResult.error; // Re-throw for upper-level handling
    }
  }
}

// Type definitions
interface UserProfile {
  id: string;
  username: string;
  astral_level: number;
  energy_points: number;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  theme: string;
  notifications: boolean;
}

interface UserStats {
  lastActive: Date;
  loginCount: number;
}

interface UserDataSummary {
  profile: UserProfile;
  preferences: UserPreferences;
  stats: UserStats;
}

// Export functionality for use in the application
export {
  loadUserProfile,
  fetchWithRetry
};
