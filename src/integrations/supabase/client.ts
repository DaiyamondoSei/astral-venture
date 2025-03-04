
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wkmyvthtyjcdzhzvfyji.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXl2dGh0eWpjZHpoenZmeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDM5OTMsImV4cCI6MjA1NjY3OTk5M30.iOgl9X2mcl-eQi5CzhluFYqVal1Qevk4kTav4zVfeMU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add custom function to handle incrementing values
export const incrementEnergyPoints = async (userId: string, pointsToAdd: number) => {
  try {
    // Get current energy points
    const { data: userData, error: fetchError } = await supabase
      .from('user_profiles')
      .select('energy_points')
      .eq('id', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const currentPoints = userData?.energy_points || 0;
    const newPoints = currentPoints + pointsToAdd;
    
    // Update with new points value
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        energy_points: newPoints,
        last_active_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    // Update astral level based on points (logarithmic progression)
    const newAstralLevel = Math.floor(Math.log10(newPoints + 1) * 3) + 1;
    
    if (newAstralLevel > 1) {
      await supabase
        .from('user_profiles')
        .update({ astral_level: newAstralLevel })
        .eq('id', userId);
    }
    
    return newPoints;
  } catch (error) {
    console.error('Error incrementing energy points:', error);
    throw error;
  }
};

// Function to calculate fractal complexity based on energy points
// This could be used in the future for more advanced visualizations
export const calculateFractalComplexity = (energyPoints: number) => {
  // Base complexity
  let complexity = 1;
  
  // Energy thresholds for complexity increase
  const thresholds = [
    { points: 750, factor: 2 },    // Basic fractal patterns
    { points: 1000, factor: 3 },   // Transcendence level
    { points: 2000, factor: 5 },   // Infinity level
    { points: 5000, factor: 8 },   // Beyond infinity
    { points: 10000, factor: 13 }  // Universal consciousness (Fibonacci sequence)
  ];
  
  // Apply threshold factors
  for (const threshold of thresholds) {
    if (energyPoints >= threshold.points) {
      complexity = threshold.factor;
    } else {
      break;
    }
  }
  
  // Add logarithmic scaling for truly infinite progression
  const logFactor = Math.log10(energyPoints + 1) / 10;
  complexity += logFactor;
  
  return complexity;
};
