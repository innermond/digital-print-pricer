import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Product, Elemental } from '../types';
import { buildSelectionPayload } from '../lib/selection';

export type Quote = {
  price: number;
  currency: string;
  timestamp: string;
};

export type PriceStatus =
  | { kind: 'idle' }
  // `previous` carries the last good quote so the panel can dim it rather than
  // collapsing to a skeleton on every re-price.
  | { kind: 'loading'; previous?: Quote }
  | { kind: 'ok'; quote: Quote }
  | { kind: 'error'; message: string };

// Long enough to swallow a press-and-hold on the quantity stepper (which emits
// ~10 updates/sec), short enough that a single click feels immediate.
const DEBOUNCE_MS = 400;
const MAX_AGE_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 50;

type UseAutoPriceOptions = {
  product: Product | undefined;
  pocketElem: Elemental | null;
  // No endpoint (host forgot to pass one, or standalone with none configured)
  // means we never fetch at all — under auto-pricing a placeholder URL would
  // fire on every option click.
  endpoint: string | null;
};

/**
 * Prices the current selection automatically, debounced.
 *
 * The cache key IS the request body. Anything that changes the price changes
 * the payload, and anything that doesn't change the payload cannot change the
 * price — so a `kind: 'ok'` status always holds the quote for the currently
 * rendered configuration. That makes a stale price structurally impossible
 * rather than something callers have to remember to invalidate.
 */
export function useAutoPrice({ product, pocketElem, endpoint }: UseAutoPriceOptions) {
  const [fetched, setFetched] = useState<PriceStatus>({ kind: 'idle' });
  const [attempt, setAttempt] = useState(0);
  const cacheRef = useRef<Map<string, Quote>>(new Map());

  const key = useMemo(
    () => (product ? JSON.stringify(buildSelectionPayload(product, pocketElem)) : null),
    [product, pocketElem]
  );

  // Nothing to price is a fact about the current props, not stored state — so
  // derive it rather than writing 'idle' from an effect.
  const inactive = !key || !endpoint;
  const status: PriceStatus = inactive ? { kind: 'idle' } : fetched;

  const retry = useCallback(() => {
    if (key) cacheRef.current.delete(key);
    setAttempt((a) => a + 1);
  }, [key]);

  useEffect(() => {
    if (!key || !endpoint) return;

    const cache = cacheRef.current;
    const cached = cache.get(key);
    if (cached && Date.now() - Date.parse(cached.timestamp) < MAX_AGE_MS) {
      setFetched({ kind: 'ok', quote: cached });
      return;
    }

    // Runs before the debounce even starts, so the old number is never
    // presented as current for a single frame.
    setFetched((prev) => ({
      kind: 'loading',
      previous: prev.kind === 'ok' ? prev.quote : prev.kind === 'loading' ? prev.previous : undefined,
    }));

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: key, // the key literally is the request body
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Eroare API: ${response.status}`);

        const result = await response.json();
        const quote: Quote = {
          price: result.price,
          currency: result.currency || 'RON',
          timestamp: new Date().toISOString(),
        };

        if (cache.size >= MAX_CACHE_ENTRIES) {
          const oldest = cache.keys().next().value;
          if (oldest !== undefined) cache.delete(oldest);
        }
        cache.set(key, quote);
        setFetched({ kind: 'ok', quote });
      } catch (error) {
        // A superseded request is not a failure — say nothing and let the
        // request that replaced it own the status.
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error
            ? error.message
            : 'Eroare la obținerea prețului. Verificați endpoint-ul API.';
        setFetched({ kind: 'error', message });
        console.error('Pricing error:', error);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, endpoint, attempt]);

  return { status, retry };
}
