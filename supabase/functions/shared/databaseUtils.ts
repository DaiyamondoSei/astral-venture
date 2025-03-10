
import { createClient } from "https://esm.sh/@supabase/supabase-js";

/**
 * Interface for database query configuration
 */
export interface QueryConfig {
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
  
  // Timeout configuration
  timeout?: number;
  
  // Logging configuration
  logQueries?: boolean;
  logQueryParams?: boolean;
}

/**
 * Create a Supabase admin client with service role key
 */
export function createAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Execute a database query with retry and timeout handling
 * @param queryFn Function that executes the query
 * @param config Query configuration
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  config: QueryConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 500,
    timeout = 10000,
    logQueries = false
  } = config;
  
  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Database query timed out after ${timeout}ms`));
    }, timeout);
  });
  
  let lastError: Error | null = null;
  
  // Retry loop
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (logQueries) {
        console.log(`Executing database query (attempt ${attempt + 1}/${maxRetries})`);
      }
      
      // Race between query and timeout
      return await Promise.race([queryFn(), timeoutPromise]);
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      const shouldRetry = 
        attempt < maxRetries - 1 && 
        (error.message?.includes('connection') || 
         error.message?.includes('timeout') ||
         error.status === 429);
      
      if (shouldRetry) {
        const delay = retryDelay * Math.pow(2, attempt);
        console.log(`Query failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }
  
  throw lastError || new Error('Query failed after all retry attempts');
}

/**
 * Fetch records safely with error handling and retry logic
 * @param table Table name
 * @param query Query builder function
 * @param config Query configuration
 */
export async function fetchRecordsSafely<T = any>(
  table: string,
  query: (queryBuilder: any) => any,
  config: QueryConfig = {}
): Promise<T[]> {
  const supabase = createAdminClient();
  
  return executeWithRetry(async () => {
    // Start with the table
    let queryBuilder = supabase.from(table).select();
    
    // Apply the query modifications
    queryBuilder = query(queryBuilder);
    
    // Execute the query
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error(`Error fetching from ${table}:`, error);
      throw error;
    }
    
    return data || [];
  }, config);
}

/**
 * Insert records safely with error handling and retry logic
 * @param table Table name
 * @param records Records to insert
 * @param config Query configuration
 */
export async function insertRecordsSafely<T = any>(
  table: string,
  records: any | any[],
  config: QueryConfig = {}
): Promise<T[]> {
  const supabase = createAdminClient();
  
  return executeWithRetry(async () => {
    const { data, error } = await supabase
      .from(table)
      .insert(records)
      .select();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
    
    return data || [];
  }, config);
}

/**
 * Update records safely with error handling and retry logic
 * @param table Table name
 * @param updates Record updates
 * @param matchColumn Column to match for updates
 * @param matchValue Value to match for updates
 * @param config Query configuration
 */
export async function updateRecordsSafely<T = any>(
  table: string,
  updates: any,
  matchColumn: string,
  matchValue: any,
  config: QueryConfig = {}
): Promise<T[]> {
  const supabase = createAdminClient();
  
  return executeWithRetry(async () => {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq(matchColumn, matchValue)
      .select();
    
    if (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
    
    return data || [];
  }, config);
}

/**
 * Delete records safely with error handling and retry logic
 * @param table Table name
 * @param matchColumn Column to match for deletion
 * @param matchValue Value to match for deletion
 * @param config Query configuration
 */
export async function deleteRecordsSafely(
  table: string,
  matchColumn: string,
  matchValue: any,
  config: QueryConfig = {}
): Promise<void> {
  const supabase = createAdminClient();
  
  return executeWithRetry(async () => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(matchColumn, matchValue);
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  }, config);
}
