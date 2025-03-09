
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface PerformanceMetric {
  componentName: string;
  averageRenderTime: number;
  renderCount: number;
  slowRenders: number;
  timestamp: string;
}

interface PerformanceRequest {
  metrics: PerformanceMetric[];
  sessionId: string;
  deviceInfo: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
  };
}

// These are automatically injected when deployed on Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
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
    
    // Get the performance metrics
    const { metrics, sessionId, deviceInfo } = await req.json() as PerformanceRequest;
    
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No metrics provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Process metrics and insert into database
    const timestamp = new Date().toISOString();
    
    // Prepare metrics for insertion
    const metricsToInsert = metrics.map(metric => ({
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
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        message: 'Performance metrics recorded successfully',
        metricsCount: metricsToInsert.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-performance function:', error);
    
    return new Response(
      JSON.stringify({ message: 'Internal server error', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
