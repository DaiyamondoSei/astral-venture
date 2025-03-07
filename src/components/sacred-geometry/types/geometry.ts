
import { ReactNode } from 'react';
import { Download, FileText, Book, Archive, Package } from 'lucide-react';

export interface DownloadableMaterial {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'audio' | 'video' | 'practice' | 'guide';
  icon: ReactNode;
}

export interface GeometryNode {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
  color: string;
  position: string;
  route?: string;
  action?: () => void;
  downloadables?: DownloadableMaterial[];
  functionalities?: string[];
}

export interface NodeStatus {
  unlocked: boolean;
  threshold: number;
}
