/**
 * Retry a promise-returning function with exponential backoff.
 * Use for Supabase/API calls to improve resilience to transient failures.
 */
export const fetchWithRetry = async <T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> => {
  const { retries = 3, delay = 1000, backoff = 2 } = options;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;

      const waitTime = delay * Math.pow(backoff, i);
      console.warn(`Retry ${i + 1}/${retries} after ${waitTime}ms`, error);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Max retries exceeded');
};
