
import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook that tracks component mount state to prevent memory leaks
 * @returns An object with isMounted function to check if component is still mounted
 */
export function useIsMounted() {
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const isMounted = useCallback(() => isMountedRef.current, []);
  
  return { isMounted };
}

/**
 * Hook that provides a safe setState function that only updates state when the component is mounted
 * @param setState The setState function from useState
 * @returns A safe version of setState that won't update unmounted components
 */
export function useSafeState<T>(setState: React.Dispatch<React.SetStateAction<T>>) {
  const { isMounted } = useIsMounted();
  
  const safeSetState = useCallback(
    (value: React.SetStateAction<T>) => {
      if (isMounted()) {
        setState(value);
      }
    },
    [isMounted, setState]
  );
  
  return safeSetState;
}

/**
 * Creates a cancelable promise to help clean up async operations
 * @param promise The promise to make cancelable
 * @returns An object with promise and cancel method
 */
export function makeCancelable<T>(promise: Promise<T>) {
  let hasCanceled = false;
  
  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      val => hasCanceled ? reject({ isCanceled: true }) : resolve(val),
      error => hasCanceled ? reject({ isCanceled: true }) : reject(error)
    );
  });
  
  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    },
  };
}
