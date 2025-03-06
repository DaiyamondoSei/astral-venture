
export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  description?: string; // Optional for backward compatibility
}

export interface GuidedTourProps {
  tourId: string;
  title: string;
  description: string;
  steps: TourStep[];
  onComplete: () => void;
}
