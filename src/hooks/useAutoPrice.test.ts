import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoPrice } from './useAutoPrice';
import { makeElemental } from '../test/fixtures';
import type { Product } from '../types';

const ENDPOINT = '/api/price';
const DEBOUNCE_MS = 400;

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod1a',
  categoryId: 'flyer',
  label: 'Fluturaș',
  amount: 50,
  elementals: [makeElemental()],
  ...overrides,
});

const priceOk = (price = 12.5) =>
  vi.fn().mockResolvedValue({ ok: true, json: async () => ({ price, currency: 'RON' }) });

const render = (product: Product | undefined, endpoint: string | null = ENDPOINT) =>
  renderHook(({ p }) => useAutoPrice({ product: p, pocketElem: null, endpoint }), {
    initialProps: { p: product },
  });

describe('useAutoPrice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', priceOk());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // Advance past the debounce and let the fetch promise chain settle. waitFor
  // is unusable here: it polls on real timers, which the fake clock blocks.
  const advance = async (ms = DEBOUNCE_MS) => {
    await act(async () => {
      vi.advanceTimersByTime(ms);
      for (let i = 0; i < 5; i++) await Promise.resolve();
    });
  };

  it('does not fire before the debounce elapses', async () => {
    render(makeProduct());
    await advance(DEBOUNCE_MS - 50);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();

    await advance(50);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it('marks itself loading immediately, before any request goes out', () => {
    const { result } = render(makeProduct());
    expect(result.current.status.kind).toBe('loading');
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('collapses rapid changes into a single request', async () => {
    const { rerender } = render(makeProduct({ amount: 1 }));
    rerender({ p: makeProduct({ amount: 2 }) });
    rerender({ p: makeProduct({ amount: 3 }) });
    await advance();

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.amount).toBe(3);
  });

  it('aborts an in-flight request when the selection changes, without erroring', async () => {
    // Hold the first request open so the change lands mid-flight.
    let release: (v: unknown) => void = () => {};
    const pending = new Promise((r) => { release = r; });
    const signals: AbortSignal[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
      signals.push(init.signal);
      if (signals.length === 1) await pending;
      return { ok: true, json: async () => ({ price: 7, currency: 'RON' }) };
    }));

    const { result, rerender } = render(makeProduct({ amount: 1 }));
    await advance();
    rerender({ p: makeProduct({ amount: 2 }) });
    await advance();

    expect(signals[0].aborted).toBe(true);
    await act(async () => {
      release(null);
      for (let i = 0; i < 5; i++) await Promise.resolve();
    });
    // The superseded request must not surface as a failure.
    expect(result.current.status).toMatchObject({ kind: 'ok', quote: { price: 7 } });
  });

  it('serves an already-priced selection from cache', async () => {
    const a = makeProduct({ amount: 1 });
    const b = makeProduct({ amount: 2 });
    const { rerender } = render(a);
    await advance();
    rerender({ p: b });
    await advance();
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);

    rerender({ p: a }); // identical payload to the first
    await advance();
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it('reports an error and recovers on retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const { result } = render(makeProduct());
    await advance();
    expect(result.current.status).toMatchObject({
      kind: 'error',
      message: 'Eroare API: 500',
    });

    vi.stubGlobal('fetch', priceOk(9));
    act(() => result.current.retry());
    await advance();
    expect(result.current.status).toMatchObject({ kind: 'ok', quote: { price: 9 } });
  });

  it('never fetches without an endpoint or a product', async () => {
    const { result } = render(makeProduct(), null);
    await advance();
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    expect(result.current.status.kind).toBe('idle');

    const { result: noProduct } = render(undefined);
    await advance();
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    expect(noProduct.current.status.kind).toBe('idle');
  });
});
