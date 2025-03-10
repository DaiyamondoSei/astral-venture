
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { ValidationError } from '@/utils/validation/errorBridge';
import { handleDatabaseError, handleNetworkError } from '@/utils/validation/errorBridge';

class SupabaseClientManager {
  private static instance: SupabaseClientManager;
  private client: ReturnType<typeof createClient<Database>>;
  
  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.client = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        storageKey: 'cosmic-app-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  public static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager();
    }
    return SupabaseClientManager.instance;
  }

  public getClient() {
    return this.client;
  }

  public async safeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: Error | null }>
  ): Promise<T> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        throw handleDatabaseError(error);
      }
      
      if (!data) {
        throw new Error('No data returned from query');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw handleNetworkError(error);
      }
      throw error;
    }
  }
}

export const supabase = SupabaseClientManager.getInstance().getClient();
export const safeQuery = SupabaseClientManager.getInstance().safeQuery.bind(
  SupabaseClientManager.getInstance()
);
