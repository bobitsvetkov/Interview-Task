import { useCallback, useEffect, useRef } from "react";

/**
 * Poll by calling `callback` every `interval` ms.
 * The callback should return `true` to stop polling.
 * Polling also stops on error or unmount.
 */
export function usePolling(callback: () => Promise<boolean>, interval: number) {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    pollRef.current = setInterval(async () => {
      try {
        const done = await callback();
        if (done) stop();
      } catch {
        stop();
      }
    }, interval);
  }, [callback, interval, stop]);

  useEffect(() => stop, [stop]);

  return { start, stop };
}
