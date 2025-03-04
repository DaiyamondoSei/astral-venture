
// Mock implementation for framer-motion
const mockMotion = {
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
  path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
  circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
};

export const motion = mockMotion;

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;
