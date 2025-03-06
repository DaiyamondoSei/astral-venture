
import { ReactNode } from 'react';

export interface DownloadableMaterial {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'audio' | 'video' | 'practice' | 'guide';
  icon: ReactNode;
}

export interface NodeDetails {
  title: string;
  description: string;
  practices: string[];
}

export interface NodeDetailsMap {
  [key: string]: NodeDetails;
}
