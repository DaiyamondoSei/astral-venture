
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Trophy, Award, List, CheckCircle } from 'lucide-react'
import { useQuantumTheme } from '@/components/visual-foundation'
import GlassmorphicContainer from '@/components/visual-foundation/GlassmorphicContainer'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

interface AchievementType {
  id: string
  title: string
  description: string
  category: 'meditation' | 'practice' | 'reflection' | 'wisdom' | 'special'
  progress?: number
  awarded?: boolean
  icon?: 'star' | 'trophy' | 'award' | 'check'
}

interface AchievementsPanelProps {
  className?: string
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ className }) => {
  const { theme } = useQuantumTheme()
  const [activeTab, setActiveTab] = useState('all')
  
  // Get user achievements from Supabase
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      try {
        // First check if the user_achievements table exists using our function
        const { data: userAchievements, error } = await supabase
          .rpc('get_user_achievements', { user_id_param: (await supabase.auth.getUser()).data.user?.id })
        
        if (error) throw error
        
        // If we don't have actual achievements yet, return placeholder data
        if (!userAchievements || userAchievements.length === 0) {
          return getPlaceholderAchievements()
        }
        
        return userAchievements.map(a => ({
          id: a.achievement_id,
          title: a.achievement_data?.title || 'Unknown Achievement',
          description: a.achievement_data?.description || 'Description not available',
          category: a.achievement_data?.category || 'special',
          progress: a.progress,
          awarded: a.awarded,
          icon: a.achievement_data?.icon || 'award'
        }))
      } catch (error) {
        console.error('Error fetching achievements:', error)
        // Return placeholder data if there's an error
        return getPlaceholderAchievements()
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
  
  // Filter achievements by category
  const filteredAchievements = activeTab === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeTab)
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }
  
  const renderAchievementIcon = (icon?: string) => {
    switch (icon) {
      case 'star': return <Star className="text-yellow-400" size={18} />;
      case 'trophy': return <Trophy className="text-amber-500" size={18} />;
      case 'check': return <CheckCircle className="text-green-400" size={18} />;
      case 'award':
      default: return <Award className="text-purple-400" size={18} />;
    }
  }
  
  return (
    <div className={cn("pb-4", className)}>
      <GlassmorphicContainer 
        variant={theme === 'default' ? 'quantum' : theme}
        intensity="medium"
        withGlow={true}
        className="p-4 mb-4"
      >
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="font-medium text-white text-lg">Achievements</h3>
            <p className="text-white/70 text-sm">
              {achievements.filter(a => a.awarded).length} unlocked of {achievements.length} total
            </p>
          </div>
        </div>
      </GlassmorphicContainer>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid grid-cols-5 bg-white/10 backdrop-blur border-white/10">
          <TabsTrigger value="all" className="text-white">All</TabsTrigger>
          <TabsTrigger value="meditation" className="text-white">Meditation</TabsTrigger>
          <TabsTrigger value="practice" className="text-white">Practice</TabsTrigger>
          <TabsTrigger value="reflection" className="text-white">Reflection</TabsTrigger>
          <TabsTrigger value="wisdom" className="text-white">Wisdom</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white/5 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="space-y-3 overflow-auto max-h-[calc(100vh-250px)]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              <List className="mx-auto mb-2 opacity-50" size={32} />
              <p>No achievements in this category yet</p>
            </div>
          ) : (
            filteredAchievements.map((achievement) => (
              <motion.div 
                key={achievement.id}
                variants={itemVariants}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  achievement.awarded 
                    ? "bg-white/15 backdrop-blur border-white/20" 
                    : "bg-white/5 backdrop-blur border-white/10"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    achievement.awarded 
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" 
                      : "bg-white/10 text-white/50"
                  )}>
                    {renderAchievementIcon(achievement.icon)}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-medium",
                      achievement.awarded ? "text-white" : "text-white/70"
                    )}>
                      {achievement.title}
                    </h4>
                    <p className="text-white/60 text-sm">
                      {achievement.description}
                    </p>
                    
                    {!achievement.awarded && achievement.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-white/70 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(achievement.progress * 100)}%</span>
                        </div>
                        <Progress 
                          value={achievement.progress * 100} 
                          className="h-1.5 bg-white/10"
                          indicatorClassName={
                            theme === 'ethereal' 
                              ? "bg-gradient-to-r from-ethereal-400 to-ethereal-600" 
                              : theme === 'astral' 
                                ? "bg-gradient-to-r from-astral-400 to-astral-600"
                                : "bg-gradient-to-r from-quantum-400 to-quantum-600"
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  )
}

// Helper function to generate placeholder achievements data
function getPlaceholderAchievements(): AchievementType[] {
  return [
    {
      id: 'first-meditation',
      title: 'First Meditation',
      description: 'Complete your first meditation session',
      category: 'meditation',
      progress: 0,
      awarded: false,
      icon: 'award'
    },
    {
      id: 'meditation-streak',
      title: 'Consistent Mind',
      description: 'Complete meditations for 3 days in a row',
      category: 'meditation',
      progress: 0.33,
      awarded: false,
      icon: 'star'
    },
    {
      id: 'first-reflection',
      title: 'Soul Searcher',
      description: 'Write your first reflection',
      category: 'reflection',
      progress: 0,
      awarded: false,
      icon: 'check'
    },
    {
      id: 'chakra-activation',
      title: 'Energy Awakening',
      description: 'Activate your first chakra',
      category: 'practice',
      progress: 0.5,
      awarded: false,
      icon: 'trophy'
    },
    {
      id: 'wisdom-unlock',
      title: 'Ancient Knowledge',
      description: 'Unlock your first wisdom insight',
      category: 'wisdom',
      progress: 0.2,
      awarded: false,
      icon: 'star'
    }
  ]
}

export default AchievementsPanel
