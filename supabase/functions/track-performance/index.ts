
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with the auth context of the function
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      throw new Error('Error getting user or user not found')
    }
    
    // Get the performance metrics from the request
    const { metrics, sessionId, deviceInfo } = await req.json()
    
    if (!metrics || !Array.isArray(metrics)) {
      throw new Error('Invalid metrics format')
    }
    
    console.log(`Processing ${metrics.length} performance metrics for user ${user.id}`)
    
    // Group metrics by component name
    const groupedMetrics = metrics.reduce((acc, metric) => {
      const { componentName } = metric
      if (!acc[componentName]) {
        acc[componentName] = []
      }
      acc[componentName].push(metric)
      return acc
    }, {})
    
    // Process and store the metrics for each component
    const results = await Promise.all(
      Object.entries(groupedMetrics).map(async ([componentName, componentMetrics]) => {
        // Calculate aggregated metrics
        const renderTimes = componentMetrics
          .map(m => m.renderTime)
          .filter(time => typeof time === 'number')
        
        if (renderTimes.length === 0) return null
        
        const totalRenders = renderTimes.length
        const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / totalRenders
        const slowRenders = renderTimes.filter(time => time > 16).length
        
        // Store aggregated metrics in the database
        const { data, error } = await supabase
          .from('performance_metrics')
          .insert({
            user_id: user.id,
            component_name: componentName,
            average_render_time: averageRenderTime,
            total_renders: totalRenders,
            slow_renders: slowRenders,
            metrics_data: componentMetrics,
            session_id: sessionId,
            device_info: deviceInfo
          })
        
        if (error) {
          console.error(`Error storing metrics for ${componentName}:`, error)
          return { componentName, success: false, error: error.message }
        }
        
        return { componentName, success: true, averageRenderTime, totalRenders }
      })
    )
    
    // Filter out null results
    const validResults = results.filter(Boolean)
    
    return new Response(
      JSON.stringify({
        success: true,
        processedComponents: validResults.length,
        results: validResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error processing performance metrics:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
