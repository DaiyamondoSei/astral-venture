
/**
 * Example of using the Result pattern in React components
 * 
 * This example demonstrates how to use Result and AsyncResult patterns within
 * React components to handle loading states, errors, and successful data rendering
 * in a type-safe way.
 */

import React, { useState, useEffect } from 'react';
import { Result, isSuccess, unwrapOr } from '../Result';
import { AsyncResult, foldAsync } from '../AsyncResult';
import { ApiService } from './ApiExample';

interface UserProfileCardProps {
  userId: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ userId }) => {
  // Use typed states that leverage the Result pattern
  const [profileResult, setProfileResult] = useState<Result<UserProfile, Error> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state when userId changes
    setIsLoading(true);
    setProfileResult(null);
    
    const apiService = new ApiService();

    const loadProfile = async () => {
      try {
        // We wrap the API call with our AsyncResult pattern
        const result = await apiService.getUserProfile(userId);
        
        // Store the result directly - includes success/error state
        setProfileResult(result);
      } catch (error) {
        // Handle unexpected errors (should be rare with our pattern)
        console.error('Unexpected error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // Render based on our state
  if (isLoading) {
    return <div className="animate-pulse p-4 bg-gray-100 rounded-lg">Loading profile...</div>;
  }

  // If we have a Result, we can use pattern matching to handle different states
  if (profileResult === null) {
    return <div className="p-4 bg-red-100 text-red-800 rounded-lg">No data available</div>;
  }

  // Use isSuccess as a type guard to safely access result values
  if (isSuccess(profileResult)) {
    const profile = profileResult.value;
    
    return (
      <div className="p-4 bg-white shadow rounded-lg">
        <h2 className="text-xl font-bold">{profile.username}</h2>
        <div className="mt-2">
          <div className="text-sm text-gray-600">Astral Level: {profile.astral_level}</div>
          <div className="text-sm text-gray-600">Energy: {profile.energy_points} points</div>
        </div>
      </div>
    );
  } else {
    // Error state - we have direct access to the typed error
    const error = profileResult.error;
    
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        <p>Error loading profile: {error.message}</p>
        {error.cause && <p className="text-sm mt-1">Reason: {String(error.cause)}</p>}
      </div>
    );
  }
};

/**
 * Example of a custom hook that uses the AsyncResult pattern
 */
function useProfileData(userId: string | null) {
  const [data, setData] = useState<{
    profile: UserProfile | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    profile: null,
    isLoading: userId !== null,
    error: null
  });

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    const apiService = new ApiService();

    const loadData = async () => {
      // Set loading state
      if (mounted) {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
      }

      // Use our AsyncResult pattern with foldAsync for clean handling
      await foldAsync(
        apiService.getUserProfile(userId),
        // Success handler
        (profile) => {
          if (mounted) {
            setData({ profile, isLoading: false, error: null });
          }
        },
        // Error handler
        (error) => {
          if (mounted) {
            setData({ profile: null, isLoading: false, error });
          }
        }
      );
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return data;
}

// Example component using the custom hook
const UserProfileDisplay: React.FC<{ userId: string | null }> = ({ userId }) => {
  const { profile, isLoading, error } = useProfileData(userId);

  if (!userId) {
    return <p>No user selected</p>;
  }

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!profile) {
    return <p>No profile data available</p>;
  }

  return (
    <div>
      <h2>{profile.username}</h2>
      <p>Level: {profile.astral_level}</p>
      <p>Points: {profile.energy_points}</p>
    </div>
  );
};

// Type definition for this file
interface UserProfile {
  id: string;
  username: string;
  astral_level: number;
  energy_points: number;
  created_at: string;
  updated_at: string;
}

export { UserProfileCard, UserProfileDisplay, useProfileData };
