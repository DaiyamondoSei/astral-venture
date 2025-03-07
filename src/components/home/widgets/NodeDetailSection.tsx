
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { getNodeDetails } from '@/components/home/node-detail/nodeDetailsData';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface NodeDetailSectionProps {
  selectedNode: string | null;
  energyPoints: number;
  selectedNodeMaterials: DownloadableMaterial[] | null;
  consciousnessLevel: number;
  onClose?: () => void;
}

const NodeDetailSection: React.FC<NodeDetailSectionProps> = ({
  selectedNode,
  energyPoints,
  selectedNodeMaterials,
  consciousnessLevel,
  onClose
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (!selectedNode) return null;
  
  const nodeDetails = getNodeDetails(selectedNode);
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="relative w-full max-w-md md:max-w-xl bg-gradient-to-r from-quantum-900/90 to-astral-900/90 rounded-lg border border-quantum-700/50 shadow-xl overflow-hidden"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, type: "spring" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          aria-label="Close panel"
        >
          <X className="w-5 h-5 text-white/90" />
        </button>
        
        {/* Header with node icon */}
        <div className="p-6 pb-4 flex items-center gap-4 border-b border-quantum-800/50">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-quantum-500 to-quantum-700 flex items-center justify-center shadow-glow-sm">
            {nodeDetails?.icon || <div className="w-6 h-6 bg-white/80 rounded-full" />}
          </div>
          <div>
            <h3 className="text-xl font-display text-white">
              {nodeDetails?.title || selectedNode.charAt(0).toUpperCase() + selectedNode.slice(1)}
            </h3>
            <p className="text-sm text-white/70">
              {nodeDetails?.subtitle || "Sacred geometry node"}
            </p>
          </div>
        </div>
        
        {/* Scrollable content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-white/90">
              {nodeDetails?.description || "This sacred geometry pattern represents a fundamental aspect of consciousness."}
            </p>
            
            {nodeDetails?.practices && nodeDetails.practices.length > 0 && (
              <>
                <h4 className="text-lg font-medium mt-4 mb-2">Practices</h4>
                <ul className="space-y-2">
                  {nodeDetails.practices.map((practice, idx) => (
                    <li key={idx} className="bg-black/20 p-3 rounded-lg">
                      <h5 className="font-medium text-white">{practice.title}</h5>
                      <p className="text-sm text-white/80 mt-1">{practice.description}</p>
                      {practice.action && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="mt-2 astral-button"
                        >
                          {practice.actionText || "Begin Practice"}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            
            {/* Downloadable materials section */}
            {selectedNodeMaterials && selectedNodeMaterials.length > 0 && (
              <>
                <h4 className="text-lg font-medium mt-4 mb-2">Downloadable Materials</h4>
                <div className="space-y-2">
                  {selectedNodeMaterials.map((material) => (
                    <div 
                      key={material.id} 
                      className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-quantum-600/50 flex items-center justify-center">
                        {material.icon || (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/90">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-white">{material.name}</h5>
                        <p className="text-xs text-white/70">{material.description}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Consciousness level requirement notice */}
            {nodeDetails?.requiredLevel && nodeDetails.requiredLevel > consciousnessLevel && (
              <div className="mt-4 p-3 bg-quantum-900/60 border border-quantum-700/50 rounded-lg">
                <p className="text-sm text-amber-300">
                  Higher consciousness level required to access all content.
                  Current: Level {consciousnessLevel}, Required: Level {nodeDetails.requiredLevel}
                </p>
                <div className="w-full h-1.5 bg-black/30 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300" 
                    style={{ width: `${(consciousnessLevel / nodeDetails.requiredLevel) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer actions */}
        <div className="border-t border-quantum-800/50 p-4 flex justify-end">
          <Button 
            variant="outline" 
            className="mr-2"
            onClick={onClose}
          >
            Close
          </Button>
          {nodeDetails?.primaryAction && (
            <Button>
              {nodeDetails.primaryActionText || "Engage"}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NodeDetailSection;
