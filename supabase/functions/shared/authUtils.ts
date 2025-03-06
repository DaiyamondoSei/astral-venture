
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, createErrorResponse, ErrorCode } from './responseUtils.ts';

// Service roles should only be used within trusted server environments
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create a Supabase client using the request's authorization header
export const createClientFromRequest = (req: Request) => {
  // Get authorization header
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return { client: null, error: 'Missing authorization header' };
  }
  
  // Expected format: "Bearer YOUR_JWT_TOKEN"
  const jwt = authHeader.replace('Bearer ', '');
  
  // Create Supabase client with user's JWT
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    }
  );
  
  return { client: supabase, error: null };
};

// Verify a user is authenticated and return user data
export const verifyAuthenticated = async (req: Request) => {
  const { client, error } = createClientFromRequest(req);
  
  if (error || !client) {
    return { user: null, error: 'Invalid client' };
  }
  
  // Get user data
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  
  if (userError || !user) {
    return { user: null, error: userError?.message || 'User not authenticated' };
  }
  
  return { user, error: null };
};

// Authentication middleware for edge functions
export const withAuth = async (
  req: Request,
  handler: (user: any, req: Request) => Promise<Response>
): Promise<Response> => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Verify authentication
  const { user, error } = await verifyAuthenticated(req);
  
  if (error || !user) {
    return createErrorResponse(
      ErrorCode.UNAUTHORIZED,
      'You must be logged in to perform this action',
      { details: error }
    );
  }
  
  // Call the handler with the authenticated user
  return handler(user, req);
};

// Helper to get user profile data
export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}
