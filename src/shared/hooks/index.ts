
/**
 * Shared Hooks
 * 
 * Reusable hooks that can be used across the application.
 */

// Auth Hooks
export * from './auth/useAuth';
export * from './auth/useUser';

// UI Hooks
export * from './ui/useElementSize';
export * from './ui/useMediaQuery';
export * from './ui/useScrollPosition';

// Data Hooks
export * from './data/useFetch';
export * from './data/useLocalStorage';
export * from './data/useCached';

// Animation Hooks
export * from './animation/useAnimationFrame';
export * from './animation/useTransition';

// App Hooks
export * from './app/useRecentActivity';
export * from './app/useEnergyPoints';
export * from './app/useUserProgress';
