
export interface ISwipeablePanelProps {
  children: React.ReactNode;
  position: 'bottom' | 'right';
  initialState?: boolean;
}

export interface SwipeIndicatorProps {
  position: 'top' | 'bottom' | 'left' | 'right';
}
