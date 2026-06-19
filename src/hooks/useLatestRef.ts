import { useRef } from 'react';
import type { MutableRefObject } from 'react';

// A ref whose .current always holds the latest value. Lets long-lived callbacks
// (e.g. setInterval) read up-to-date props/handlers without re-subscribing.
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
