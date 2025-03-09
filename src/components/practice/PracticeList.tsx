
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Practice, PracticeProgress } from '@/services/practice/practiceService';
import PracticeCard from './PracticeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface PracticeListProps {
  practices: Practice[];
  completedPracticeIds?: string[];
  progress?: PracticeProgress | null;
  onSelectPractice: (id: string) => void;
  className?: string;
}

const PracticeList: React.FC<PracticeListProps> = ({
  practices,
  completedPracticeIds = [],
  progress,
  onSelectPractice,
  className
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Group practices by type
  const meditationPractices = practices.filter(p => p.type === 'meditation');
  const taskPractices = practices.filter(p => p.type === 'quantum-task');
  const integrationPractices = practices.filter(p => p.type === 'integration');
  
  // Get practices based on active tab
  const getFilteredPractices = () => {
    switch (activeTab) {
      case 'meditation':
        return meditationPractices;
      case 'quantum-task':
        return taskPractices;
      case 'integration':
        return integrationPractices;
      default:
        return practices;
    }
  };
  
  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress summary */}
      {progress && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/40 rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-white">{progress.totalCompleted}</div>
            <div className="text-xs text-white/60">Practices Completed</div>
          </div>
          
          <div className="bg-gray-900/40 rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-white">{progress.streakCount}</div>
            <div className="text-xs text-white/60">Day Streak</div>
          </div>
          
          <div className="bg-gray-900/40 rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold capitalize text-white">
              {progress.favoriteType !== 'none' ? 
                (progress.favoriteType === 'quantum-task' ? 'Tasks' : progress.favoriteType)
                : 'None'}
            </div>
            <div className="text-xs text-white/60">Favorite Type</div>
          </div>
        </div>
      )}
      
      {/* Practice tabs */}
      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full mb-6">
          <TabsTrigger value="all" className="flex-1">
            <Activity className="h-4 w-4 mr-2" />
            All
          </TabsTrigger>
          <TabsTrigger value="meditation" className="flex-1">
            <Star className="h-4 w-4 mr-2" />
            Meditation
          </TabsTrigger>
          <TabsTrigger value="quantum-task" className="flex-1">
            <Zap className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {getFilteredPractices().map(practice => (
              <motion.div key={practice.id} variants={itemVariants}>
                <PracticeCard
                  practice={practice}
                  onClick={() => onSelectPractice(practice.id)}
                  isCompleted={completedPracticeIds.includes(practice.id)}
                />
              </motion.div>
            ))}
            
            {getFilteredPractices().length === 0 && (
              <motion.div 
                className="col-span-2 p-8 text-center text-white/60"
                variants={itemVariants}
              >
                No practices available in this category yet.
              </motion.div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PracticeList;
