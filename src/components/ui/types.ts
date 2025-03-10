
import { ReactNode } from 'react';

/**
 * Props for the SwipeablePanel component
 */
export interface ISwipeablePanelProps {
  /** Content to display inside the panel */
  children: ReactNode;
  /** Position of the panel */
  position: 'bottom' | 'right';
  /** Initial state of the panel (open or closed) */
  initialState?: boolean;
  /** Optional title for the panel */
  title?: string;
  /** Optional height for the panel */
  height?: string;
}

/**
 * Props for the SwipeIndicator component
 */
export interface ISwipeIndicatorProps {
  /** Position of the indicator */
  position: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Props for the InfoPanel component
 */
export interface IInfoPanelProps {
  /** Node information */
  node?: any;
  /** Function to call when the panel is closed */
  onClose?: () => void;
  /** Visual theme for the panel */
  theme?: 'default' | 'ethereal' | 'quantum';
}

/**
 * Props for the NodeDetailPanel component
 */
export interface INodeDetailPanelProps {
  /** ID of the node to display details for */
  nodeId: string;
  /** Energy points for the node */
  energyPoints?: number[];
}

/**
 * Props for the DownloadableMaterialsPanel component
 */
export interface IDownloadableMaterialsPanelProps {
  /** Materials available for download */
  materials: any[];
  /** Name of the node */
  nodeName: string;
}

/**
 * Props for the SacredHomePage component
 */
export interface ISacredHomePageProps {
  /** Optional user information */
  user?: any;
  /** Optional user profile information */
  userProfile?: any;
  /** Optional user streak information */
  userStreak?: {
    current: number;
    longest: number;
  };
  /** Optional activated chakras */
  activatedChakras?: number[];
  /** Optional logout handler */
  onLogout?: () => void;
  /** Function to handle node selection */
  onNodeSelect?: (nodeId: string) => void;
}

/**
 * Props for the AchievementHeader component
 */
export interface IAchievementHeaderProps {
  /** Count of achievements */
  achievementCount?: number;
}

/**
 * Props for the AchievementFilter component
 */
export interface IAchievementFilterProps {
  /** Available categories */
  categories?: any[];
  /** Currently selected filter */
  selectedFilter?: string;
  /** Filter change handler */
  onFilterChange?: (filter: string) => void;
}

/**
 * Props for the EmptyAchievementList component
 */
export interface IEmptyAchievementListProps {
  /** Currently selected category */
  selectedCategory: string;
}

/**
 * Props for the VisualSystem component
 */
export interface IVisualSystemProps {
  /** Whether to show background effects */
  showBackground?: boolean;
  /** Whether to show Metatron's Cube */
  showMetatronsCube?: boolean;
  /** Intensity of background effects */
  backgroundIntensity?: string;
  /** Child components */
  children?: ReactNode;
}

/**
 * Valid variants for glassmorphic components
 */
export type GlassmorphicVariant = 'default' | 'ethereal' | 'quantum' | 'cosmic';
