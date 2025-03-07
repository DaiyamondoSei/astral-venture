
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import NodeDetailContent from '@/components/home/node-detail/NodeDetailContent';
import PracticeActionButton from '@/components/home/node-detail/PracticeActionButton';
import PracticesList from '@/components/home/node-detail/PracticesList';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface NodeDetailSectionProps {
  activeNodeId: string | null;
  activeNodeName?: string;
  activeNodeDescription?: string;
  downloadables?: DownloadableMaterial[];
  className?: string;
  onClose?: () => void;
}

/**
 * Displays detailed information about the selected sacred geometry node
 */
const NodeDetailSection: React.FC<NodeDetailSectionProps> = ({
  activeNodeId,
  activeNodeName,
  activeNodeDescription,
  downloadables,
  className,
  onClose
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (!activeNodeId) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className={cn("w-full max-w-md mx-auto md:max-w-lg", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard 
          variant="purple" 
          className="p-4 md:p-6 relative"
          animate={true}
        >
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
              aria-label="Close details"
            >
              <X size={16} className="text-white/80" />
            </button>
          )}
          
          <NodeDetailContent 
            nodeId={activeNodeId}
            title={activeNodeName || activeNodeId.charAt(0).toUpperCase() + activeNodeId.slice(1)}
            description={activeNodeDescription || "Explore the sacred geometry of this node and its cosmic implications."}
          />
          
          {/* Practice section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Practices</h3>
            <PracticesList nodeId={activeNodeId} />
          </div>
          
          {/* Call to action */}
          <div className="mt-6 flex justify-center">
            <PracticeActionButton nodeId={activeNodeId} />
          </div>
          
          {/* Downloadable resources section */}
          {downloadables && downloadables.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 overflow-y-auto max-h-36 custom-scrollbar pr-1">
                {downloadables.map((item, index) => (
                  <li key={`download-${index}`} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-quantum-400 rounded-full mr-2 flex-shrink-0"></span>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-quantum-300 hover:text-quantum-200 transition-colors focus-outline"
                    >
                      {item.title || `Resource ${index + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
};

export default NodeDetailSection;
