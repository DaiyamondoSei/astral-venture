
// Supabase Edge Function for performance tracking
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { ErrorCode, createErrorResponse, createSuccessResponse, corsHeaders, validateRequiredParameters } from "../shared/responseUtils.ts";

// Create a Supabase client for the edge function
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Type definitions for performance metrics
interface PerformanceMetric {
  component_name?: string;
  metric_name: string;
  value: number;
  category: string;
  timestamp: string;
  type: string;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  device_info?: Record<string, any>;
}

interface WebVitals {
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  ttfb: number;
  inp?: number;
}

interface ComponentMetrics {
  totalComponents: number;
  avgRenderTime: number;
  slowComponents: number;
  totalRenders: number;
}

interface PerformanceSummary {
  webVitals: WebVitals;
  components: ComponentMetrics;
  timestamp: string;
}

interface TrackPerformancePayload {
  metrics: PerformanceMetric[];
  summary?: PerformanceSummary;
  userId?: string;
  sessionId?: string;
}

/**
 * Ensure necessary database tables exist
 */
async function ensureTablesExist(): Promise<boolean> {
  try {
    // Check if performance_metrics table exists
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .in('tablename', ['performance_metrics', 'performance_summaries']);

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return false;
    }

    const tableNames = (tables || []).map(t => t.tablename);
    let needsMigration = false;
    
    // Create performance_metrics table if it doesn't exist
    if (!tableNames.includes('performance_metrics')) {
      needsMigration = true;
      const { error } = await supabase.rpc('create_performance_metrics_table');
      if (error) {
        console.error('Error creating performance_metrics table:', error);
        return false;
      }
    }
    
    // Create performance_summaries table if it doesn't exist
    if (!tableNames.includes('performance_summaries')) {
      needsMigration = true;
      const { error } = await supabase.rpc('create_performance_summaries_table');
      if (error) {
        console.error('Error creating performance_summaries table:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
    return false;
  }
}

/**
 * Store performance metrics in the database
 */
async function storePerformanceMetrics(metrics: PerformanceMetric[]): Promise<boolean> {
  try {
    if (metrics.length === 0) {
      return true;
    }
    
    // Ensure user_id is present
    const processedMetrics = metrics.map(metric => ({
      ...metric,
      timestamp: metric.timestamp || new Date().toISOString()
    }));
    
    // Insert metrics in batches of 100
    const batchSize = 100;
    for (let i = 0; i < processedMetrics.length; i += batchSize) {
      const batch = processedMetrics.slice(i, i + batchSize);
      const { error } = await supabase
        .from('performance_metrics')
        .insert(batch);
        
      if (error) {
        console.error('Error inserting metrics batch:', error);
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error storing performance metrics:', error);
    throw error;
  }
}

/**
 * Store performance summary in the database
 */
async function storePerformanceSummary(
  summary: PerformanceSummary,
  userId?: string,
  sessionId?: string,
  url?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('performance_summaries')
      .insert({
        web_vitals: summary.webVitals,
        component_metrics: summary.components,
        timestamp: summary.timestamp || new Date().toISOString(),
        user_id: userId,
        session_id: sessionId,
        page_url: url
      });
      
    if (error) {
      console.error('Error inserting performance summary:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error storing performance summary:', error);
    throw error;
  }
}

/**
 * Main request handler
 */
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return createErrorResponse(
        ErrorCode.INVALID_REQUEST,
        'Method not allowed',
        { allowedMethod: 'POST' },
        405
      );
    }

    // Parse request body
    const payload = await req.json() as TrackPerformancePayload;
    
    // Validate required parameters
    const validation = validateRequiredParameters(
      { metrics: payload.metrics },
      ['metrics']
    );
    
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.MISSING_PARAMETERS,
        'Missing required parameters',
        { missingParams: validation.missingParams }
      );
    }
    
    // Ensure required tables exist
    await ensureTablesExist();
    
    // Store metrics
    await storePerformanceMetrics(payload.metrics);
    
    // Store summary if provided
    if (payload.summary) {
      await storePerformanceSummary(
        payload.summary,
        payload.userId,
        payload.sessionId,
        payload.metrics[0]?.page_url
      );
    }
    
    // Return success response
    return createSuccessResponse(
      { 
        processed: payload.metrics.length,
        summaryStored: !!payload.summary 
      },
      { operation: 'track_performance' }
    );
  } catch (error) {
    console.error('Error in track-performance function:', error);
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Error processing performance metrics',
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
});
