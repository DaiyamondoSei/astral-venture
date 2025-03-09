
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NavigationNode {
  id: string;
  label: string;
  description: string;
  icon_type: string;
  position_x: number;
  position_y: number;
  route: string;
  is_active: boolean;
  is_disabled: boolean;
  sort_order: number;
  requires_auth: boolean;
}

interface NavigationConnection {
  id: string;
  from_node_id: string;
  to_node_id: string;
  strength: number;
  is_visible: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userLevel = url.searchParams.get('level') || '1';
    const theme = url.searchParams.get('theme') || 'default';
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user authorization if available
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
        console.log(`Authenticated request from user: ${userId}`);
      }
    }
    
    // In a real implementation, we would query the database for nodes and connections
    // For now, we'll simulate a database response with static data
    
    // Mock data retrieval based on user level and auth status
    // In a real implementation, this would be a database query
    const nodes = Array.from({ length: 7 }, (_, i) => ({
      id: i.toString(),
      label: i === 0 ? 'Core' : ['Practices', 'Wisdom', 'Progress', 'Dreams', 'Insights', 'Community'][i-1],
      description: i === 0 ? 'Your spiritual journey center' : `Description for node ${i}`,
      icon_type: ['seed-of-life', 'flower-of-life', 'tree-of-life', 'golden-ratio', 'merkaba', 'fibonacci', 'torus'][i],
      position_x: i === 0 ? 50 : [30, 70, 20, 80, 30, 70][i-1],
      position_y: i === 0 ? 50 : [25, 25, 50, 50, 75, 75][i-1],
      route: i === 0 ? '/dashboard' : [`/practices`, `/wisdom`, `/progress`, `/dreams`, `/insights`, `/community`][i-1],
      is_active: true,
      is_disabled: parseInt(userLevel) < i,
      sort_order: i,
      requires_auth: i > 3
    }));
    
    // Create connections between nodes
    const connections = [
      // Center connections
      { id: 'c0-1', from_node_id: '0', to_node_id: '1', strength: 1, is_visible: true },
      { id: 'c0-2', from_node_id: '0', to_node_id: '2', strength: 1, is_visible: true },
      { id: 'c0-3', from_node_id: '0', to_node_id: '3', strength: 1, is_visible: true },
      { id: 'c0-4', from_node_id: '0', to_node_id: '4', strength: 1, is_visible: true },
      { id: 'c0-5', from_node_id: '0', to_node_id: '5', strength: 1, is_visible: true },
      { id: 'c0-6', from_node_id: '0', to_node_id: '6', strength: 1, is_visible: true },
      // Outer hexagon
      { id: 'c1-2', from_node_id: '1', to_node_id: '2', strength: 0.8, is_visible: true },
      { id: 'c2-4', from_node_id: '2', to_node_id: '4', strength: 0.8, is_visible: true },
      { id: 'c4-6', from_node_id: '4', to_node_id: '6', strength: 0.8, is_visible: true },
      { id: 'c6-5', from_node_id: '6', to_node_id: '5', strength: 0.8, is_visible: true },
      { id: 'c5-3', from_node_id: '5', to_node_id: '3', strength: 0.8, is_visible: true },
      { id: 'c3-1', from_node_id: '3', to_node_id: '1', strength: 0.8, is_visible: true },
      // Cross connections
      { id: 'c1-5', from_node_id: '1', to_node_id: '5', strength: 0.6, is_visible: true },
      { id: 'c2-6', from_node_id: '2', to_node_id: '6', strength: 0.6, is_visible: true },
      { id: 'c3-4', from_node_id: '3', to_node_id: '4', strength: 0.6, is_visible: true }
    ];
    
    // Apply any user-specific filtering
    if (userId) {
      // Here we could add personalized logic based on user's progress, etc.
      console.log('Applying user-specific navigation customization');
    }
    
    // Apply theme-specific visual adjustments if needed
    const themeAdjustments = {
      default: {},
      cosmic: { intensity: 1.2 },
      ethereal: { intensity: 0.8 },
      quantum: { intensity: 1.5 }
    };
    
    // Transform database format to client format
    const clientNodes = nodes.map(node => ({
      id: node.id,
      label: node.label,
      description: node.description,
      iconType: node.icon_type,
      x: node.position_x,
      y: node.position_y,
      route: node.route,
      isActive: node.is_active,
      isDisabled: node.is_disabled
    }));
    
    const clientConnections = connections.map(conn => ({
      id: conn.id,
      from: conn.from_node_id,
      to: conn.to_node_id,
      strength: conn.strength
    }));
    
    // Return the navigation data
    return new Response(
      JSON.stringify({ 
        nodes: clientNodes, 
        connections: clientConnections,
        meta: {
          themeSettings: themeAdjustments[theme as keyof typeof themeAdjustments] || themeAdjustments.default,
          userLevel: parseInt(userLevel),
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in get-navigation-nodes function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        errorCode: 'NAVIGATION_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
