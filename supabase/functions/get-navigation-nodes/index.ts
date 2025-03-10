import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { corsHeaders, handleCorsRequest } from "../shared/responseUtils.ts";
import { withAuth } from "../shared/authUtils.ts";

// Processing function with authentication
async function handler(user: any, req: Request): Promise<Response> {
  try {
    // Parse request body
    const { level = '1', theme = 'default' } = await req.json();
    
    // Generate nodes based on user level and theme
    const { nodes, connections } = generateNavigationData(parseInt(level), theme, user.id);
    
    // Create response
    return new Response(
      JSON.stringify({
        nodes,
        connections,
        meta: {
          themeSettings: getThemeSettings(theme),
          userLevel: parseInt(level),
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error in get-navigation-nodes:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

// Generate nodes and connections
function generateNavigationData(level: number, theme: string, userId: string) {
  
  // Base nodes (always present)
  const baseNodes = [
    {
      id: 'root',
      label: 'Center',
      x: 50,
      y: 50,
      description: 'Core connection to everything',
      route: '/dashboard'
    },
    {
      id: 'meditation',
      label: 'Meditation',
      x: 50,
      y: 20,
      description: 'Enhance your meditation practice',
      route: '/meditation'
    },
    {
      id: 'reflection',
      label: 'Reflection',
      x: 80,
      y: 50,
      description: 'Reflect on your journey',
      route: '/reflection'
    },
    {
      id: 'dreams',
      label: 'Dreams',
      x: 50,
      y: 80,
      description: 'Explore your dream state',
      route: '/dreams'
    },
    {
      id: 'chakras',
      label: 'Chakras',
      x: 20,
      y: 50,
      description: 'Balance your energy centers',
      route: '/chakras'
    }
  ];
  
  // Add level-dependent nodes
  let nodes = [...baseNodes];
  
  if (level >= 2) {
    nodes.push({
      id: 'astral',
      label: 'Astral',
      x: 30,
      y: 30,
      description: 'Explore astral projection',
      route: '/astral'
    });
  }
  
  if (level >= 3) {
    nodes.push({
      id: 'quantum',
      label: 'Quantum',
      x: 70,
      y: 30,
      description: 'Quantum consciousness techniques',
      route: '/quantum'
    });
  }
  
  if (level >= 4) {
    nodes.push({
      id: 'transcendence',
      label: 'Transcendence',
      x: 70,
      y: 70,
      description: 'Transcend ordinary consciousness',
      route: '/transcendence'
    });
  }
  
  if (level >= 5) {
    nodes.push({
      id: 'unity',
      label: 'Unity',
      x: 30,
      y: 70,
      description: 'Experience universal oneness',
      route: '/unity'
    });
  }
  
  // Generate connections between nodes
  const connections = [];
  
  // Connect root to all base nodes
  for (const node of nodes) {
    if (node.id !== 'root') {
      connections.push({
        id: `root-${node.id}`,
        from: 'root',
        to: node.id
      });
    }
  }
  
  // Add more complex connections for higher levels
  if (level >= 3) {
    connections.push(
      { id: 'meditation-astral', from: 'meditation', to: 'astral' },
      { id: 'chakras-astral', from: 'chakras', to: 'astral' },
      { id: 'meditation-quantum', from: 'meditation', to: 'quantum' },
      { id: 'reflection-quantum', from: 'reflection', to: 'quantum' }
    );
  }
  
  if (level >= 4) {
    connections.push(
      { id: 'quantum-transcendence', from: 'quantum', to: 'transcendence' },
      { id: 'reflection-transcendence', from: 'reflection', to: 'transcendence' },
      { id: 'dreams-transcendence', from: 'dreams', to: 'transcendence' }
    );
  }
  
  if (level >= 5) {
    connections.push(
      { id: 'chakras-unity', from: 'chakras', to: 'unity' },
      { id: 'dreams-unity', from: 'dreams', to: 'unity' },
      { id: 'astral-unity', from: 'astral', to: 'unity' },
      { id: 'unity-transcendence', from: 'unity', to: 'transcendence' }
    );
  }
  
  return { nodes, connections };
}

// Get theme-specific settings
function getThemeSettings(theme: string) {
  
  const baseColors = {
    default: { 
      primary: '#3498db', 
      secondary: '#2ecc71',
      accent: '#9b59b6'
    },
    cosmic: { 
      primary: '#8e44ad', 
      secondary: '#3498db',
      accent: '#2c3e50'
    },
    ethereal: { 
      primary: '#1abc9c', 
      secondary: '#f1c40f',
      accent: '#e74c3c'
    },
    quantum: { 
      primary: '#e67e22', 
      secondary: '#34495e',
      accent: '#16a085'
    }
  };
  
  return {
    colors: baseColors[theme as keyof typeof baseColors] || baseColors.default,
    glowIntensity: theme === 'cosmic' || theme === 'quantum' ? 'high' : 'medium',
    animations: theme === 'ethereal' ? 'fluid' : 'standard'
  };
}

// Entry point for the edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  // Process with authentication
  return withAuth(req, handler);
});
