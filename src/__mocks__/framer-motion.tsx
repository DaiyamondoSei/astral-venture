
import React from 'react';

// Basic mock for motion components
const createMotionComponent = (type: keyof JSX.IntrinsicElements) => {
  return React.forwardRef((props: any, ref) => {
    // Extract animation properties to avoid console warnings
    const {
      initial, animate, exit, transition,
      variants, whileHover, whileTap, whileFocus,
      whileDrag, whileInView, ...restProps
    } = props;

    return React.createElement(type, {
      ...restProps,
      ref
    });
  });
};

// Create motion components for common elements
export const motion = {
  div: createMotionComponent('div'),
  span: createMotionComponent('span'),
  button: createMotionComponent('button'),
  a: createMotionComponent('a'),
  ul: createMotionComponent('ul'),
  li: createMotionComponent('li'),
  p: createMotionComponent('p'),
  svg: createMotionComponent('svg'),
  path: createMotionComponent('path'),
  circle: createMotionComponent('circle'),
  rect: createMotionComponent('rect')
};

// Mock for AnimatePresence
export const AnimatePresence = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Mock for Variants type
export type Variants = Record<string, any>;

// Mock for useAnimation hook
export const useAnimation = () => {
  return {
    start: () => Promise.resolve(),
    stop: () => {},
    set: () => {}
  };
};

// Mock for useCycle hook
export const useCycle = <T extends any>(...items: T[]) => {
  const [index, setIndex] = React.useState(0);
  const cycle = React.useCallback(
    (next?: number) => {
      setIndex(
        next !== undefined
          ? next
          : (prev => (prev + 1) % items.length)
      );
    },
    [items.length]
  );
  
  return [items[index], cycle] as const;
};
