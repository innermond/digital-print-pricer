import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssemblySummary } from './AssemblySummary';
import { makeElemental, makeFinishing } from '../test/fixtures';
import type { Product } from '../types';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  categoryId: 'cat-1',
  label: 'Pliant A4',
  amount: 100,
  elementals: [makeElemental()],
  ...overrides,
});

describe('AssemblySummary', () => {
  it('renders nothing without a product', () => {
    const { container } = render(<AssemblySummary product={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the amount with Romanian pluralization', () => {
    const { rerender } = render(<AssemblySummary product={makeProduct({ amount: 100 })} />);
    expect(screen.getByText('Asamblare (100 unități)')).toBeInTheDocument();

    rerender(<AssemblySummary product={makeProduct({ amount: 1 })} />);
    expect(screen.getByText('Asamblare (1 unitate)')).toBeInTheDocument();
  });

  it('lists each elemental with its details', () => {
    const elementals = [
      makeElemental({ id: 'e1', label: 'Copertă' }),
      makeElemental({
        id: 'e2',
        label: 'Interior',
        finishing: makeFinishing({
          lamination: { type: 'gloss', sides: 'front' },
          folding: { type: 'half-fold', folds: 1 },
        }),
      }),
    ];
    const { container } = render(<AssemblySummary product={makeProduct({ elementals })} />);

    expect(screen.getByText('1. Copertă')).toBeInTheDocument();
    expect(screen.getByText('2. Interior')).toBeInTheDocument();
    expect(container.textContent).toContain('250 GSM - Lucios Premium');
    expect(container.textContent).toContain('210.0×297.0 mm');
    expect(container.textContent).toContain('Lucios');
    expect(container.textContent).toContain('La jumătate');
  });

  it('summarizes the product with element pluralization', () => {
    const { container, rerender } = render(<AssemblySummary product={makeProduct()} />);
    expect(container.textContent).toContain('Pliant A4 (1 element) × 100');

    rerender(
      <AssemblySummary
        product={makeProduct({
          elementals: [makeElemental({ id: 'e1' }), makeElemental({ id: 'e2' })],
        })}
      />,
    );
    expect(container.textContent).toContain('Pliant A4 (2 elemente) × 100');
  });

  it('shows the staple line only when a staple option is active', () => {
    const { container, rerender } = render(<AssemblySummary product={makeProduct()} />);
    expect(container.textContent).not.toContain('Capsare:');

    rerender(
      <AssemblySummary
        product={makeProduct({
          elementals: [
            makeElemental({ finishing: makeFinishing({ staple: { hole: true, staple: true } }) }),
          ],
        })}
      />,
    );
    expect(container.textContent).toContain('Capsare:');
    expect(container.textContent).toContain('Gaură, Capsă');
  });

  it('shows the spiral binding color', () => {
    const { container } = render(
      <AssemblySummary product={makeProduct({ binding: { type: 'spiral', color: 'black' } })} />,
    );
    expect(container.textContent).toContain('Spirală:');
    expect(container.textContent).toContain('Negru');
  });
});
