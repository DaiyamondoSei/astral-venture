
// This file now re-exports the usePerformance hook from the context file
// for backward compatibility and consistent imports

import { usePerformance } from '@/contexts/PerformanceContext';

export { usePerformance };
export default usePerformance;
