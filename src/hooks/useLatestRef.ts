import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

// A ref whose .current always holds the latest value. Lets long-lived callbacks
// (e.g. setInterval) read up-to-date props/handlers without re-subscribing.
// The ref is updated in a layout effect (not during render, which React forbids)
// so it is current before any subsequent event handler or timer reads it.
export function useLatestRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
