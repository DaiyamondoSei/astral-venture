
/**
 * Type definitions for node detail components
 */

export interface DownloadableMaterial {
  id: string;
  name: string;
  description?: string;
  url?: string;
  type: 'pdf' | 'audio' | 'video' | 'practice' | 'guide';
  icon?: React.ReactNode;
  format?: 'pdf' | 'image' | 'audio' | 'video' | 'document';
  iconType?: string;
  size?: string;
  title?: string; // For backward compatibility
}

export interface NodeDetailData {
  title: string;
  description: string;
  practices: string[];
  downloads?: DownloadableMaterial[];
  energyRequirement?: number;
  nodeType?: 'core' | 'elemental' | 'advanced' | 'user';
}

export interface NodeDetailsMap {
  [key: string]: NodeDetailData;
}
