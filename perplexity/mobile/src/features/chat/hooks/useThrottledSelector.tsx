/**
 * useThrottledSelector.ts
 *
 * During streaming, the store can receive 50-100 token updates per second.
 * Each one calls setState → React re-renders the whole tree → JS thread
 * saturates → gesture events queue up → the app feels frozen.
 *
 * This hook decouples the store update rate from the React render rate:
 *   - Store still updates on every token (source of truth, fast)
 *   - React re-renders at most every `intervalMs` (default 50ms = 20 fps)
 *
 * Drop-in replacement for useChatStore(selector) on hot paths.
 */

import { useEffect, useReducer, useRef } from "react";
import { useChatStore } from "../store/chat.store";

export function useThrottledSelector<T>(
  selector: (state: ReturnType<typeof useChatStore.getState>) => T,
  intervalMs = 50,
): T {
  // Keep latest selected value in a ref — no re-render cost
  const valueRef = useRef<T>(selector(useChatStore.getState()));

  // Cheap counter to trigger re-renders only when value actually changed
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    // Poll the store at a controlled rate
    const id = setInterval(() => {
      const next = selector(useChatStore.getState());
      if (next !== valueRef.current) {
        valueRef.current = next;
        forceUpdate();
      }
    }, intervalMs);

    return () => clearInterval(id);
    // selector is assumed stable (defined outside component or wrapped in useCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return valueRef.current;
}

/**
 * Convenience: subscribe to messages[] at 20fps max.
 * isStreaming / isLoading use normal subscriptions (they change rarely).
 */
export function useThrottledMessages(intervalMs = 50) {
  return useThrottledSelector((s) => s.messages, intervalMs);
}