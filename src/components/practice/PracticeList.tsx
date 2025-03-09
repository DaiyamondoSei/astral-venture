
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PracticeCard from './PracticeCard';
import { Practice, PracticeCompletion } from '@/services/practice/practiceService';
import { Zap, Star, Activity, RefreshCw } from 'lucide-react';

interface PracticeListProps {
  practices: Practice[];
  completedPractices?: PracticeCompletion[];
  onSelectPractice: (id: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

const PracticeList: React.FC<PracticeListProps> = ({
  practices,
  completedPractices = [],
  onSelectPractice,
  onRefresh,
  isLoading = false,
  className
}) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter practices based on tab
  const filteredPractices = practices.filter(practice => {
    if (activeTab === 'all') return true;
    return practice.type === activeTab;
  });
  
  // Check if a practice is completed
  const isPracticeCompleted = (id: string) => {
    return completedPractices.some(completion => completion.practiceId === id);
  };
  
  // Count practices by type
  const typeCounts = {
    meditation: practices.filter(p => p.type === 'meditation').length,
    'quantum-task': practices.filter(p => p.type === 'quantum-task').length,
    integration: practices.filter(p => p.type === 'integration').length
  };
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-display font-bold text-white/90">Practices</h2>
        
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-gray-800/40 border border-gray-700/30">
          <TabsTrigger value="all" className="data-[state=active]:bg-gray-700/50">
            <Activity className="h-4 w-4 mr-2" />
            All ({practices.length})
          </TabsTrigger>
          <TabsTrigger value="meditation" className="data-[state=active]:bg-gray-700/50">
            <Star className="h-4 w-4 mr-2" />
            Meditation ({typeCounts.meditation})
          </TabsTrigger>
          <TabsTrigger value="quantum-task" className="data-[state=active]:bg-gray-700/50">
            <Zap className="h-4 w-4 mr-2" />
            Tasks ({typeCounts['quantum-task']})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div 
                  key={i} 
                  className="rounded-xl bg-gray-800/20 border border-gray-700/30 h-40 animate-pulse"
                />
              ))}
            </div>
          ) : filteredPractices.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {filteredPractices.map((practice) => (
                <PracticeCard
                  key={practice.id}
                  practice={practice}
                  onClick={() => onSelectPractice(practice.id)}
                  isCompleted={isPracticeCompleted(practice.id)}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-white/70 mb-2">No practices available</h3>
              <p className="text-white/50 text-sm">
                {activeTab === 'all'
                  ? 'No practices are currently available for your level.'
                  : `No ${activeTab} practices are available yet.`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PracticeList;
