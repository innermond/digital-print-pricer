import type { Product, Elemental } from '../types';

// The full selection that produced a price: posted to the price endpoint and
// shared with the host (pricer:offer event) so it can email / act on the quote.
// The pocket is catalog data rather than an elemental, but it has always reached the
// price endpoint as one — so it is appended here, keeping the wire format unchanged.
export function buildSelectionPayload(product: Product, pocketElem?: Elemental | null) {
  const elementals = pocketElem ? [...product.elementals, pocketElem] : product.elementals;
  return {
    productId: product.id,
    productLabel: product.label,
    amount: product.amount,
    elementals: elementals.map(elem => ({
      label: elem.label,
      media: {
        kind: elem.media.kind,
        id: elem.media.id,
        label: elem.media.label,
        gsm: elem.media.gsm,
        ...(elem.media.kind === 'paper'   ? { finish: elem.media.finish } : {}),
        ...(elem.media.kind === 'sticker' ? { face: elem.media.face }     : {}),
      },
      size: {
        width: elem.size.width,
        height: elem.size.height,
        unit: elem.size.unit,
      },
      printing: elem.printing,
      pageCount: elem.pageCount,
      finishing: {
        ...elem.finishing,
        // `max` is a catalog constraint, not a customer choice — send only what
        // was chosen, so the wire format stays exactly what it has always been.
        creasing: { count: elem.finishing.creasing.count },
      },
    })),
    // A product-wide operation rather than a part, so it rides at the top level
    // next to the binding. Always sent, on or off: the host prices the absence of
    // a hole on a product that offers one differently from a product with none.
    punchHole: product.punchHole ?? false,
    // `{ type: 'none' }` is a real Binding but means unbound, so it must not
    // reach the wire — the payload shape stays exactly what it has always been.
    ...(product.binding?.type === 'spiral' ? { binding: product.binding } : {}),
  };
}
