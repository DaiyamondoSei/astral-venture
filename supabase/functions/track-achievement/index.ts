
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface AchievementEvent {
  eventType: string;
  eventData?: Record<string, any>;
}

interface AchievementResponse {
  unlockedAchievements: any[];
  updatedProgress: Record<string, number>;
  energyPoints: number;
}

// These are automatically injected when deployed on Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Achievement event processing
async function processAchievementEvent(userId: string, event: AchievementEvent): Promise<AchievementResponse> {
  const { eventType, eventData = {} } = event;
  
  // Default response
  const response: AchievementResponse = {
    unlockedAchievements: [],
    updatedProgress: {},
    energyPoints: 0
  };
  
  try {
    // First, record the activity
    const { error: activityError } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: eventType,
        activity_data: eventData,
        created_at: new Date().toISOString()
      });
      
    if (activityError) {
      console.error('Error recording activity:', activityError);
    }
    
    // Update progress values based on event type
    await updateProgressValues(userId, eventType, eventData, response);
    
    // Check for unlocked achievements
    await checkAchievements(userId, response);
    
    // Award energy points if achievements were unlocked
    if (response.unlockedAchievements.length > 0) {
      const pointsToAward = response.unlockedAchievements.reduce((sum, achievement) => 
        sum + (achievement.points || 0), 0);
        
      if (pointsToAward > 0) {
        await awardEnergyPoints(userId, pointsToAward);
        response.energyPoints = pointsToAward;
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error processing achievement event:', error);
    throw error;
  }
}

// Helper function to update progress values
async function updateProgressValues(
  userId: string, 
  eventType: string, 
  eventData: Record<string, any>,
  response: AchievementResponse
): Promise<void> {
  // Get progress tracking
  const progressUpdates: Record<string, number> = {};
  
  // Map event types to progress categories
  switch (eventType) {
    case 'reflection_completed':
      progressUpdates.reflections = 1;
      break;
    case 'meditation_completed':
      progressUpdates.meditation_minutes = eventData.duration || 1;
      break;
    case 'chakra_activated':
      progressUpdates.chakras_activated = 1;
      break;
    case 'wisdom_explored':
      progressUpdates.wisdom_resources_explored = 1;
      break;
    case 'streak_updated':
      // Don't increment, just set to the current value
      progressUpdates.streakDays = eventData.currentStreak || 0;
      break;
    // Add more cases as needed
  }
  
  // Update the user_progress table with the new values
  for (const [category, amount] of Object.entries(progressUpdates)) {
    // First, check if the progress record exists
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .single();
    
    let newValue = amount;
    
    if (existingProgress) {
      // If it exists, update it
      if (eventType === 'streak_updated') {
        // For streaks, we set the value directly
        newValue = amount;
      } else {
        // For other types, we increment
        newValue = (existingProgress.value || 0) + amount;
      }
      
      const { error: updateError } = await supabase
        .from('user_progress')
        .update({ value: newValue, updated_at: new Date().toISOString() })
        .eq('id', existingProgress.id);
        
      if (updateError) {
        console.error(`Error updating progress for ${category}:`, updateError);
      }
    } else {
      // If it doesn't exist, create it
      const { error: insertError } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          category,
          value: newValue,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error(`Error creating progress for ${category}:`, insertError);
      }
    }
    
    // Add to response
    response.updatedProgress[category] = newValue;
  }
}

// Helper function to check for unlocked achievements
async function checkAchievements(userId: string, response: AchievementResponse): Promise<void> {
  // Get all achievement definitions
  const { data: achievementDefinitions, error: definitionsError } = await supabase
    .from('achievements')
    .select('*');
    
  if (definitionsError || !achievementDefinitions) {
    console.error('Error fetching achievement definitions:', definitionsError);
    return;
  }
  
  // Get all user progress
  const { data: userProgress, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);
    
  if (progressError) {
    console.error('Error fetching user progress:', progressError);
    return;
  }
  
  // Get already unlocked achievements
  const { data: userAchievements, error: achievementsError } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId);
    
  if (achievementsError) {
    console.error('Error fetching user achievements:', achievementsError);
    return;
  }
  
  // Create progress map for easier lookup
  const progressMap: Record<string, number> = {};
  userProgress?.forEach(p => {
    progressMap[p.category] = p.value;
  });
  
  // Create set of already unlocked achievement IDs
  const unlockedAchievementIds = new Set(
    userAchievements?.filter(a => a.progress >= 1)
      .map(a => a.achievement_id) || []
  );
  
  // Check each achievement to see if it should be unlocked
  for (const achievement of achievementDefinitions) {
    // Skip if already unlocked
    if (unlockedAchievementIds.has(achievement.id)) {
      continue;
    }
    
    // Calculate progress based on achievement type
    let progress = 0;
    let shouldUnlock = false;
    
    switch (achievement.type) {
      case 'streak':
        if (achievement.streak_days && progressMap.streakDays >= achievement.streak_days) {
          progress = 1;
          shouldUnlock = true;
        } else if (achievement.streak_days) {
          progress = progressMap.streakDays / achievement.streak_days;
        }
        break;
        
      case 'milestone':
        if (achievement.tracked_value && achievement.threshold) {
          const value = progressMap[achievement.tracked_value] || 0;
          if (value >= achievement.threshold) {
            progress = 1;
            shouldUnlock = true;
          } else {
            progress = value / achievement.threshold;
          }
        }
        break;
        
      // Add other achievement types as needed
    }
    
    // Get existing achievement record
    const existingAchievement = userAchievements?.find(a => a.achievement_id === achievement.id);
    
    if (existingAchievement) {
      // If it exists and progress changed, update it
      if (progress > existingAchievement.progress) {
        const { error: updateError } = await supabase
          .from('user_achievements')
          .update({
            progress,
            unlocked_at: shouldUnlock ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAchievement.id);
          
        if (updateError) {
          console.error('Error updating achievement:', updateError);
        }
        
        if (shouldUnlock) {
          response.unlockedAchievements.push({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            points: achievement.points,
            type: achievement.type
          });
        }
      }
    } else if (progress > 0) {
      // If it doesn't exist and progress is > 0, create it
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          progress,
          unlocked_at: shouldUnlock ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          achievement_data: {
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            points: achievement.points,
            type: achievement.type
          }
        });
        
      if (insertError) {
        console.error('Error creating achievement:', insertError);
      }
      
      if (shouldUnlock) {
        response.unlockedAchievements.push({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          type: achievement.type
        });
      }
    }
  }
}

// Helper function to award energy points
async function awardEnergyPoints(userId: string, points: number): Promise<void> {
  try {
    // Call the add_energy_points function
    const { error } = await supabase.rpc('add_energy_points', {
      user_id_param: userId,
      points_param: points
    });
    
    if (error) {
      console.error('Error awarding energy points:', error);
    }
  } catch (error) {
    console.error('Exception awarding energy points:', error);
  }
}

// Main handler
Deno.serve(async (req) => {
  try {
    // Check if the request has a valid JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT and get the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ message: 'Invalid token or user not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the achievement event
    const event = await req.json() as AchievementEvent;
    
    // Process the event
    const response = await processAchievementEvent(user.id, event);

    // Return the response
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-achievement function:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
