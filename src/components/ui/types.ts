
export interface ISwipeablePanelProps {
  children: React.ReactNode;
  position: 'bottom' | 'right';
  initialState?: boolean;
  title?: string;
  height?: string;
}

export interface SwipeIndicatorProps {
  position: 'top' | 'bottom' | 'left' | 'right';
}
