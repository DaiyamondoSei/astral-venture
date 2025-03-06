
import { keyframes } from '@emotion/react';

// Cosmic pulsation effect for energy points and auras
export const cosmicPulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

// Ethereal glow animation for transcendent elements
export const etherealGlow = keyframes`
  0% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5)); }
  50% { filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8)); }
  100% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5)); }
`;

// Chakra activation animation
export const chakraActivate = keyframes`
  0% { transform: scale(0.8); opacity: 0.3; }
  20% { transform: scale(1.5); opacity: 1; }
  40% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.7; }
`;

// Quantum particle movement animation
export const quantumFloat = keyframes`
  0% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(5px) translateX(3px); }
  50% { transform: translateY(0) translateX(7px); }
  75% { transform: translateY(-5px) translateX(3px); }
  100% { transform: translateY(0) translateX(0); }
`;

// Sacred geometry rotation animation
export const sacredRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Starfield twinkling animation
export const starTwinkle = keyframes`
  0% { opacity: 0.1; }
  50% { opacity: 1; }
  100% { opacity: 0.1; }
`;

// Energy flow animation for trails and connections
export const energyFlow = keyframes`
  0% { stroke-dashoffset: 1000; opacity: 0.3; }
  50% { opacity: 0.8; }
  100% { stroke-dashoffset: 0; opacity: 0.3; }
`;

// Animation durations and timing functions
export const animationTimings = {
  slow: '8s',
  medium: '5s',
  fast: '3s',
  veryFast: '1.5s',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};
