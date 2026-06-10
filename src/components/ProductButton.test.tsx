import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductButton } from './ProductButton';
import type { Elemental, Product } from '../types';

const elemental = { id: 'el-1' } as Elemental;

const product: Product = {
  id: 'prod-1',
  categoryId: 'cat-1',
  label: 'Pliant A4',
  amount: 100,
  elementals: [elemental],
};

describe('ProductButton', () => {
  it('renders the product label', () => {
    render(<ProductButton product={product} selectedProductId="prod-1" onClick={() => {}} />);
    expect(screen.getByText('Pliant A4')).toBeInTheDocument();
  });

  it('pluralizes the elemental count', () => {
    const { rerender } = render(
      <ProductButton product={product} selectedProductId="prod-1" onClick={() => {}} />,
    );
    expect(screen.getByText('1 element')).toBeInTheDocument();

    rerender(
      <ProductButton
        product={{ ...product, elementals: [elemental, elemental] }}
        selectedProductId="prod-1"
        onClick={() => {}}
      />,
    );
    expect(screen.getByText('2 elements')).toBeInTheDocument();
  });

  it('calls onClick when pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ProductButton product={product} selectedProductId="prod-1" onClick={onClick} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('highlights the button when it is the selected product', () => {
    const { rerender } = render(
      <ProductButton product={product} selectedProductId="prod-1" onClick={() => {}} />,
    );
    expect(screen.getByRole('button')).toHaveClass('border-blue-400');

    rerender(<ProductButton product={product} selectedProductId="other" onClick={() => {}} />);
    expect(screen.getByRole('button')).not.toHaveClass('border-blue-400');
  });

  it('wraps the button in a Badge when badgeText is given', () => {
    render(
      <ProductButton
        product={product}
        selectedProductId="prod-1"
        badgeText="product details"
        onClick={() => {}}
      />,
    );
    expect(screen.getByText('product details')).toBeInTheDocument();
  });

  it('renders no badge without badgeText', () => {
    render(<ProductButton product={product} selectedProductId="prod-1" onClick={() => {}} />);
    expect(screen.queryByText('ⓘ')).not.toBeInTheDocument();
  });
});
