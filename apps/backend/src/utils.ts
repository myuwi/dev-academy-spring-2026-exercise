import { sleep } from "bun";

interface RetryOptions {
  minTimeout?: number;
  multiplier?: number;
  maxAttempts?: number;
  onError?: (error: unknown, attempt: number, timeout: number) => void;
}

export const retry = async <T>(
  fn: (() => Promise<T>) | (() => T),
  options: RetryOptions = {},
): Promise<T> => {
  const { minTimeout = 5000, maxAttempts = 5, multiplier = 2, onError } = options;

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (e) {
      if (attempt + 1 >= maxAttempts) {
        throw e;
      }
      const timeout = minTimeout * Math.pow(multiplier, attempt);
      onError?.(e, attempt, timeout);

      await sleep(timeout);
    }
    attempt++;
  }
};
