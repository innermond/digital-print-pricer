import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryButton } from './CategoryButton';
import type { ProductCategory } from '../types';

const category: ProductCategory = {
  id: 'cat-1',
  label: 'Flyere',
};

describe('CategoryButton', () => {
  it('renders the category label', () => {
    render(<CategoryButton category={category} presetCount={3} onClick={() => {}} />);
    expect(screen.getByText('Flyere')).toBeInTheDocument();
  });

  it('pluralizes the preset count', () => {
    const { rerender } = render(
      <CategoryButton category={category} presetCount={1} onClick={() => {}} />,
    );
    expect(screen.getByText('1 variantă')).toBeInTheDocument();

    rerender(<CategoryButton category={category} presetCount={3} onClick={() => {}} />);
    expect(screen.getByText('3 variante')).toBeInTheDocument();
  });

  it('calls onClick when pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<CategoryButton category={category} presetCount={3} onClick={onClick} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('highlights the button when it is the selected category', () => {
    const { rerender } = render(
      <CategoryButton category={category} selectedCategoryId="cat-1" presetCount={3} onClick={() => {}} />,
    );
    expect(screen.getByRole('button')).toHaveClass('border-blue-400');

    rerender(
      <CategoryButton category={category} selectedCategoryId="cat-2" presetCount={3} onClick={() => {}} />,
    );
    expect(screen.getByRole('button')).not.toHaveClass('border-blue-400');
  });

  it('wraps the button in a Badge when the category has an explanation', () => {
    render(
      <CategoryButton
        category={{ ...category, explanation: 'category details' }}
        presetCount={3}
        onClick={() => {}}
      />,
    );
    expect(screen.getByText('category details')).toBeInTheDocument();
  });

  it('renders no badge without an explanation', () => {
    render(<CategoryButton category={category} presetCount={3} onClick={() => {}} />);
    expect(screen.queryByText('ⓘ')).not.toBeInTheDocument();
  });
});
