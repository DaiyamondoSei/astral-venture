
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { validatePerformanceMetrics, calculatePerformanceInsights } from './utils.ts';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// These are automatically injected when deployed on Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if the request has a valid JWT
    const authHeader = req.headers.get('Authorization');
    let userId = 'anonymous';
    
    if (authHeader) {
      // Verify the JWT and get the user
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && user) {
        userId = user.id;
      }
    }
    
    // Parse request body
    const requestBody = await req.json();
    const { metrics = [], sessionId, deviceInfo } = requestBody;
    
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No metrics provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate and normalize metrics
    const validatedMetrics = validatePerformanceMetrics(metrics);
    if (validatedMetrics.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No valid metrics provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate insights from the metrics
    const insights = calculatePerformanceInsights(validatedMetrics);
    
    // Prepare for database insertion
    const timestamp = new Date().toISOString();
    const metricsToInsert = validatedMetrics.map(metric => ({
      user_id: userId,
      session_id: sessionId,
      component_name: metric.componentName,
      average_render_time: metric.averageRenderTime,
      total_renders: metric.renderCount,
      slow_renders: metric.slowRenders,
      device_info: deviceInfo,
      created_at: timestamp
    }));
    
    // Insert metrics into database
    const { error: insertError } = await supabase
      .from('performance_metrics')
      .insert(metricsToInsert);
      
    if (insertError) {
      console.error('Error inserting performance metrics:', insertError);
      
      return new Response(
        JSON.stringify({ 
          message: 'Error inserting performance metrics', 
          error: insertError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return success response with insights
    return new Response(
      JSON.stringify({ 
        message: 'Performance metrics recorded successfully',
        metricsCount: metricsToInsert.length,
        insights
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-performance function:', error);
    
    return new Response(
      JSON.stringify({ message: 'Internal server error', error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
