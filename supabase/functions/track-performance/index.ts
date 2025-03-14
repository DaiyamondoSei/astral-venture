
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define metric type enum
enum MetricType {
  RENDER = 'render',
  INTERACTION = 'interaction',
  LOAD = 'load',
  NAVIGATION = 'navigation',
  RESOURCE = 'resource',
  CUSTOM = 'custom'
}

// Define web vital category enum
enum WebVitalCategory {
  LOADING = 'loading',
  INTERACTION = 'interaction',
  VISUAL_STABILITY = 'visual_stability'
}

// Define a function to handle the request
const handleRequest = async (req: Request): Promise<Response> => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Parse the request body
    const { metrics, deviceInfo, userId } = await req.json();
    
    if (!metrics || !Array.isArray(metrics)) {
      return new Response(
        JSON.stringify({ error: 'Metrics array is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate metrics
    const validatedMetrics = metrics.filter(validateMetric);
    
    if (validatedMetrics.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid metrics provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Store metrics in database
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert(
        validatedMetrics.map(metric => ({
          user_id: userId || null,
          metric_name: metric.name,
          metric_type: metric.type,
          value: metric.value,
          timestamp: new Date(metric.timestamp || Date.now()).toISOString(),
          device_info: deviceInfo || null,
          metadata: metric.metadata || null
        }))
      );
    
    if (error) {
      console.error('Error storing metrics:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to store metrics' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully stored ${validatedMetrics.length} metrics` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing performance tracking:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

// Validate a metric
function validateMetric(metric: any): boolean {
  if (!metric || typeof metric !== 'object') return false;
  
  // Check required fields
  if (!metric.name || typeof metric.name !== 'string') return false;
  if (!metric.type || !Object.values(MetricType).includes(metric.type)) return false;
  if (!metric.value || !isFinite(metric.value)) return false;
  
  // If it's a web vital, validate the category
  if (metric.type === MetricType.CUSTOM && metric.category) {
    if (!Object.values(WebVitalCategory).includes(metric.category)) return false;
  }
  
  return true;
}

// Start serving the function
serve(handleRequest);
