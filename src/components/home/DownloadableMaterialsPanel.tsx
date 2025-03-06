
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Download, FileText, Package, Book, Archive, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface DownloadableMaterial {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'audio' | 'video' | 'practice' | 'guide';
  icon: React.ReactNode;
}

interface DownloadableMaterialsPanelProps {
  materials: DownloadableMaterial[];
  nodeName: string;
}

const DownloadableMaterialsPanel: React.FC<DownloadableMaterialsPanelProps> = ({
  materials,
  nodeName
}) => {
  const handleDownload = (material: DownloadableMaterial) => {
    // This would typically initiate a download or open a viewer
    // For now, we'll just show a toast notification
    toast({
      title: `Downloading ${material.name}`,
      description: `Your ${material.type} will begin downloading shortly.`,
      duration: 3000,
    });
  };

  if (!materials || materials.length === 0) {
    return (
      <div className="glass-card p-6 mt-4">
        <h3 className="text-lg font-display mb-2">Materials</h3>
        <p className="text-sm text-white/70">No downloadable materials available for {nodeName}.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 mt-4"
    >
      <div className="flex items-center mb-4">
        <Download className="mr-2 text-quantum-400" size={18} />
        <h3 className="text-lg font-display">Downloadable Materials</h3>
      </div>
      
      <div className="space-y-3">
        {materials.map((material) => (
          <motion.div 
            key={material.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-all"
          >
            <div className="flex items-start">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                material.type === 'pdf' ? "bg-rose-500/20" : 
                material.type === 'audio' ? "bg-blue-500/20" : 
                material.type === 'video' ? "bg-purple-500/20" : 
                material.type === 'practice' ? "bg-emerald-500/20" : 
                "bg-amber-500/20"
              )}>
                {material.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-white">{material.name}</h4>
                <p className="text-sm text-white/70">{material.description}</p>
                
                <div className="flex items-center mt-2">
                  <span className="text-xs uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">
                    {material.type}
                  </span>
                  
                  <div className="flex-1"></div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto text-xs flex items-center glass"
                    onClick={() => handleDownload(material)}
                  >
                    <Download size={12} className="mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DownloadableMaterialsPanel;
