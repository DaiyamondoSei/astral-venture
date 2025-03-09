
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePracticeSystem } from '@/hooks/usePracticeSystem';
import { useAuth } from '@/contexts/AuthContext';
import PracticeList from '@/components/practice/PracticeList';
import PracticeDetail from '@/components/practice/PracticeDetail';
import CosmicBackground from '@/components/visual-foundation/CosmicBackground';
import { Activity, Star, Calendar, Award } from 'lucide-react';

const PracticePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);
  const { 
    practices, 
    selectedPractice, 
    progress, 
    completedPractices, 
    isLoading, 
    error, 
    selectPractice, 
    completePractice,
    refreshData
  } = usePracticeSystem();
  
  const handleSelectPractice = async (id: string) => {
    await selectPractice(id);
    setSelectedPracticeId(id);
  };
  
  const handlePracticeComplete = async (duration: number, reflection?: string) => {
    const success = await completePractice(duration, reflection);
    if (success) {
      setSelectedPracticeId(null);
    }
    return success;
  };
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <CosmicBackground className="absolute inset-0 z-0" />
      
      {/* Main content */}
      <main className="relative z-10 container mx-auto max-w-6xl px-4 py-6">
        {!selectedPracticeId ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-white/90 mb-2">
                Quantum Practice Space
              </h1>
              <p className="text-white/70">
                Build your consciousness through meditation and quantum practices
              </p>
            </div>
            
            {/* Stats row */}
            {user && progress && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div 
                  className="p-4 rounded-lg bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center mb-1">
                    <Activity className="h-4 w-4 text-purple-400 mr-2" />
                    <h3 className="text-sm font-medium text-white/80">Completed</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{progress.totalCompleted}</p>
                  <p className="text-xs text-white/50">Total practices</p>
                </motion.div>
                
                <motion.div 
                  className="p-4 rounded-lg bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center mb-1">
                    <Calendar className="h-4 w-4 text-blue-400 mr-2" />
                    <h3 className="text-sm font-medium text-white/80">Streak</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{progress.streakCount}</p>
                  <p className="text-xs text-white/50">Days in a row</p>
                </motion.div>
                
                <motion.div 
                  className="p-4 rounded-lg bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center mb-1">
                    <Star className="h-4 w-4 text-green-400 mr-2" />
                    <h3 className="text-sm font-medium text-white/80">Favorite</h3>
                  </div>
                  <p className="text-2xl font-bold text-white capitalize">{progress.favoriteType || '-'}</p>
                  <p className="text-xs text-white/50">Most practiced type</p>
                </motion.div>
                
                <motion.div 
                  className="p-4 rounded-lg bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center mb-1">
                    <Award className="h-4 w-4 text-amber-400 mr-2" />
                    <h3 className="text-sm font-medium text-white/80">Today</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{progress.completedToday ? 'Complete' : 'Pending'}</p>
                  <p className="text-xs text-white/50">Daily practice status</p>
                </motion.div>
              </div>
            )}
            
            {/* Practice list */}
            <PracticeList
              practices={practices}
              completedPractices={completedPractices}
              onSelectPractice={handleSelectPractice}
              onRefresh={refreshData}
              isLoading={isLoading}
            />
          </>
        ) : (
          selectedPractice && (
            <PracticeDetail
              practice={selectedPractice}
              onBack={() => setSelectedPracticeId(null)}
              onComplete={handlePracticeComplete}
            />
          )
        )}
      </main>
    </div>
  );
};

export default PracticePage;
