
/**
 * Example React component using the Result pattern
 * 
 * This demonstrates how to use the Result pattern in a React component
 * to handle data fetching, error states, and loading states.
 */

import React, { useState, useEffect } from 'react';
import { ApiClient } from './ApiExample';
import { isSuccess, isFailure, unwrapOr } from '../Result';
import { EnhancedError, ErrorSubtype } from '../ResultTypes';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProfileProps {
  userId: string;
  onError?: (error: Error) => void;
}

/**
 * Example component that fetches and displays a user profile
 */
const UserProfile: React.FC<UserProfileProps> = ({ userId, onError }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const apiClient = new ApiClient('https://api.example.com');
    let isMounted = true;
    
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      
      const result = await apiClient.getUser(userId);
      
      if (!isMounted) return;
      
      if (isSuccess(result)) {
        setUser(result.value);
        setError(null);
      } else {
        setUser(null);
        setError(result.error);
        
        // Optionally propagate the error
        if (onError) {
          onError(result.error);
        }
      }
      
      setLoading(false);
    };
    
    fetchUser();
    
    return () => {
      isMounted = false;
    };
  }, [userId, onError]);
  
  // Handle loading state
  if (loading) {
    return <div>Loading user profile...</div>;
  }
  
  // Handle error state
  if (error) {
    return renderError(error);
  }
  
  // Handle missing user state (should not happen with proper error handling)
  if (!user) {
    return <div>No user data available</div>;
  }
  
  // Render success state
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
};

/**
 * Render appropriate error message based on error type
 */
function renderError(error: Error): React.ReactElement {
  // Check if it's our enhanced error type
  const enhancedError = error as EnhancedError;
  
  // Render different error UIs based on error subtype
  switch (enhancedError.subtype) {
    case ErrorSubtype.NETWORK:
      return (
        <div className="error network-error">
          <h3>Network Error</h3>
          <p>Unable to connect to the server. Please check your internet connection.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
      
    case ErrorSubtype.AUTH:
      return (
        <div className="error auth-error">
          <h3>Authentication Error</h3>
          <p>You are not authorized to view this user profile.</p>
          <button onClick={() => window.location.href = '/login'}>Log in</button>
        </div>
      );
      
    case ErrorSubtype.RESOURCE_NOT_FOUND:
      return (
        <div className="error not-found-error">
          <h3>User Not Found</h3>
          <p>The requested user profile does not exist or has been removed.</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      );
      
    default:
      return (
        <div className="error unknown-error">
          <h3>Error Loading Profile</h3>
          <p>{error.message || 'An unknown error occurred'}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
  }
}

export default UserProfile;
