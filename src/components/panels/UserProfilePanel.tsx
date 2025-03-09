
import React from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Bell, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuantumTheme } from '@/components/visual-foundation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import GlassmorphicContainer from '@/components/visual-foundation/GlassmorphicContainer'
import { cn } from '@/lib/utils'

interface UserProfilePanelProps {
  className?: string
}

const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ className }) => {
  const { user, signOut } = useAuth()
  const { theme } = useQuantumTheme()
  const { toast } = useToast()
  
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      }
    })
  }
  
  return (
    <div className={cn("space-y-4 pb-4", className)}>
      {/* User profile section */}
      <GlassmorphicContainer 
        variant={theme === 'default' ? 'quantum' : theme}
        intensity="medium"
        withGlow={true}
        className="p-4"
      >
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-600 flex items-center justify-center text-white">
            <User size={28} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-white text-lg">
              {user?.email ? user.email.split('@')[0] : 'Cosmic Explorer'}
            </h3>
            <p className="text-white/70 text-sm">
              Astral Level 1 • 0 Energy Points
            </p>
          </div>
          
          <Button
            variant="glass"
            size="sm"
            className="ml-auto"
            aria-label="Settings"
          >
            <Settings size={18} />
          </Button>
        </div>
      </GlassmorphicContainer>
      
      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
          <Card className="bg-white/10 backdrop-blur border-white/10 text-white hover:bg-white/15 transition-colors">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Bell className="mb-2 text-quantum-300" size={24} />
              <span className="text-sm">Notifications</span>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
          <Card 
            className="bg-white/10 backdrop-blur border-white/10 text-white hover:bg-white/15 transition-colors cursor-pointer"
            onClick={handleSignOut}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <LogOut className="mb-2 text-quantum-300" size={24} />
              <span className="text-sm">Sign Out</span>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Account stats */}
      <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
        <Card className="bg-white/5 backdrop-blur border-white/10 text-white">
          <CardHeader className="py-3 px-4">
            <h4 className="text-sm font-medium">Your Journey</h4>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Meditations</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Practices</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Reflections</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Current Streak</span>
                <span className="font-medium">0 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default UserProfilePanel
