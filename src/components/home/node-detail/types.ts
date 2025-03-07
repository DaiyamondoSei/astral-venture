
/**
 * Type definitions for node detail components
 */

export interface DownloadableMaterial {
  title?: string;
  description?: string;
  url?: string;
  format?: 'pdf' | 'image' | 'audio' | 'video' | 'document';
  iconType?: string;
  size?: string;
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
