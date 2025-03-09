
import { supabase } from '@/integrations/supabase/client'
import { queryClient } from '@/App'

/**
 * Pre-fetch user data and achievements for smoother panel opening experience
 */
export async function preloadPanelData() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return
    
    // Pre-fetch user data for profile panel
    queryClient.prefetchQuery({
      queryKey: ['user-profile', user.id],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (error) throw error
          return data
        } catch (error) {
          console.error('Error pre-fetching user profile:', error)
          return null
        }
      }
    })
    
    // Pre-fetch achievements for achievements panel
    queryClient.prefetchQuery({
      queryKey: ['achievements'],
      queryFn: async () => {
        try {
          // Use RPC function to get achievements
          const { data, error } = await supabase.rpc('get_user_achievements', { 
            user_id_param: user.id 
          })
          
          if (error) throw error
          return data || []
        } catch (error) {
          console.error('Error pre-fetching achievements:', error)
          return []
        }
      }
    })
    
    // Pre-fetch portal state for seed of life portal
    queryClient.prefetchQuery({
      queryKey: ['portal-state', user.id],
      queryFn: async () => {
        try {
          const { data, error } = await supabase.rpc('get_user_portal_state', { 
            user_id_param: user.id 
          })
          
          if (error) throw error
          return data || []
        } catch (error) {
          console.error('Error pre-fetching portal state:', error)
          return []
        }
      }
    })
    
  } catch (error) {
    console.error('Error in preloading panel data:', error)
  }
}
