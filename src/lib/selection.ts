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
      finishing: elem.finishing,
    })),
    ...(product.binding ? { binding: product.binding } : {}),
  };
}
