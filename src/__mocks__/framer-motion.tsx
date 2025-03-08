
/**
 * Framer Motion Mock for Testing
 */

import React from 'react';

// Motion components
export const motion = {
  div: (props: any) => <div {...props}>{props.children}</div>,
  span: (props: any) => <span {...props}>{props.children}</span>,
  path: (props: any) => <path {...props} />,
  svg: (props: any) => <svg {...props}>{props.children}</svg>,
  circle: (props: any) => <circle {...props}>{props.children}</circle>,
  g: (props: any) => <g {...props}>{props.children}</g>,
  rect: (props: any) => <rect {...props} />,
  button: (props: any) => <button {...props}>{props.children}</button>,
  a: (props: any) => <a {...props}>{props.children}</a>,
  img: (props: any) => <img {...props} />,
  ul: (props: any) => <ul {...props}>{props.children}</ul>,
  li: (props: any) => <li {...props}>{props.children}</li>,
  h1: (props: any) => <h1 {...props}>{props.children}</h1>,
  h2: (props: any) => <h2 {...props}>{props.children}</h2>,
  h3: (props: any) => <h3 {...props}>{props.children}</h3>,
  h4: (props: any) => <h4 {...props}>{props.children}</h4>,
  p: (props: any) => <p {...props}>{props.children}</p>,
  section: (props: any) => <section {...props}>{props.children}</section>,
  article: (props: any) => <article {...props}>{props.children}</article>,
  header: (props: any) => <header {...props}>{props.children}</header>,
  footer: (props: any) => <footer {...props}>{props.children}</footer>,
  main: (props: any) => <main {...props}>{props.children}</main>,
  nav: (props: any) => <nav {...props}>{props.children}</nav>,
  aside: (props: any) => <aside {...props}>{props.children}</aside>,
  form: (props: any) => <form {...props}>{props.children}</form>,
  input: (props: any) => <input {...props} />,
  textarea: (props: any) => <textarea {...props}>{props.children}</textarea>,
  select: (props: any) => <select {...props}>{props.children}</select>,
  label: (props: any) => <label {...props}>{props.children}</label>,
};

// Animation controls
export const useAnimation = () => ({
  start: jest.fn(),
  stop: jest.fn(),
  set: jest.fn(),
});

// Variants
export const Variants = {};

// AnimatePresence
export const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Animations
export const animate = jest.fn();
export const animatePresence = jest.fn();

// Gestures
export const useDragControls = jest.fn(() => ({
  start: jest.fn(),
}));

// Hooks
export const useMotionValue = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
  onChange: jest.fn(),
}));

export const useTransform = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
}));

export const useSpring = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
}));

export const useViewportScroll = jest.fn(() => ({
  scrollY: {
    get: jest.fn(),
    onChange: jest.fn(),
  },
}));

export const useReducedMotion = jest.fn(() => false);

// Utils
export const transform = {
  translateX: jest.fn(),
  translateY: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
};

export const useInView = jest.fn(() => [React.createRef(), true]);
