import { useState, useCallback } from 'react';

export const useSimulatedDelay = (delayMs: number = 2000) => {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async <T>(callback?: () => T): Promise<T | void> => {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, delayMs));
      setIsLoading(false);
      return callback?.();
    },
    [delayMs]
  );

  return { isLoading, execute };
};
