import { Mail, RefreshCw } from 'lucide-react';
import type { Product } from '../types';
import type { PriceStatus, Quote } from '../hooks/useAutoPrice';
import { NumericButton } from './NumericButton';
import { Badge } from './Badge';

const ENDPOINT_HINT =
  'Asigurați-vă că URL-ul endpoint-ului API este configurat corect și returnează: { price: number, currency?: string }';

type PricePanelProps = {
  product: Product;
  status: PriceStatus;
  onRetry: () => void;
  onRequestOffer: () => void;
  onAmountStep: (delta: number) => void;
  onAmountSet: (amount: number) => void;
  // The offer button and the timestamp only belong on the final stage; the
  // panel itself follows the user through every stage.
  showOffer?: boolean;
  amountBadgeText?: string;
};

const money = (q: Quote, multiplier = 1) => `${q.currency} ${(q.price * multiplier).toFixed(2)}`;

export function PricePanel({
  product,
  status,
  onRetry,
  onRequestOffer,
  onAmountStep,
  onAmountSet,
  showOffer = false,
  amountBadgeText,
}: PricePanelProps) {
  // Only a quote for the current configuration may leave this component — see
  // useAutoPrice: any change to the selection invalidates `ok`.
  const quote = status.kind === 'ok' ? status.quote : null;
  const stale = status.kind === 'loading' ? status.previous : undefined;
  const busy = status.kind === 'loading';

  return (
    <div
      aria-busy={busy}
      className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-4 shadow-sm"
    >
      <div className="mb-3">
        <label
          htmlFor="price-panel-amount"
          className="block text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-1.5"
        >
          Cantitate
        </label>
        <div className="flex items-center gap-1 rounded bg-white dark:bg-emerald-900 px-2 py-1 max-w-40">
          <NumericButton
            id="price-panel-amount"
            style="flex-1"
            onClickMinus={() => onAmountStep(-1)}
            onChange={(e) => {
              const n = parseInt(e.currentTarget.value, 10);
              if (!Number.isNaN(n)) onAmountSet(n);
            }}
            onClickPlus={() => onAmountStep(+1)}
            value={product.amount}
            badgeText={amountBadgeText}
          />
        </div>
      </div>

      {status.kind === 'error' ? (
        // No figure at all while errored — a wrong price is worse than none.
        <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3">
          <div className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">
            ⚠️ Prețul nu a putut fi calculat
          </div>
          <div className="text-sm text-red-600 dark:text-red-400 mb-2 break-words">
            <Badge text={ENDPOINT_HINT} label="?">
              <span>{status.message}</span>
            </Badge>
          </div>
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-red-900 px-3 py-1.5 text-sm font-semibold text-red-700 dark:text-red-200 transition hover:bg-red-100 dark:hover:bg-red-800"
          >
            <RefreshCw size={14} />
            Reîncearcă
          </button>
        </div>
      ) : status.kind === 'idle' ? (
        <div className="text-sm text-emerald-700 dark:text-emerald-300">
          Preț indisponibil — endpoint neconfigurat
        </div>
      ) : (
        <div className={busy ? 'opacity-40 transition-opacity' : 'transition-opacity'}>
          {quote || stale ? (
            <>
              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-0.5">
                Preț unitar:
              </div>
              <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
                {money((quote ?? stale)!)}
              </div>
              <div className="rounded bg-white dark:bg-emerald-900 p-2">
                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  Total pentru {product.amount} {product.amount !== 1 ? 'unități' : 'unitate'}:
                </div>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  {money((quote ?? stale)!, product.amount)}
                </div>
              </div>
            </>
          ) : (
            // First price for this selection — nothing to dim, so show bones.
            <div className="animate-pulse">
              <div className="h-3 w-20 rounded bg-emerald-200 dark:bg-emerald-800 mb-2" />
              <div className="h-6 w-28 rounded bg-emerald-200 dark:bg-emerald-800 mb-3" />
              <div className="h-10 w-full rounded bg-emerald-100 dark:bg-emerald-900" />
            </div>
          )}
        </div>
      )}

      {busy && (
        <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          Se calculează...
        </div>
      )}

      {showOffer && (
        <>
          {quote && (
            <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
              Ultima actualizare: {new Date(quote.timestamp).toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={onRequestOffer}
            // Disabled unless the quote matches the current configuration, so a
            // superseded price can never reach the host as an offer.
            disabled={!quote}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200 transition hover:bg-emerald-100 dark:hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Mail size={16} />
            Cere ofertă pe email
          </button>
        </>
      )}
    </div>
  );
}
