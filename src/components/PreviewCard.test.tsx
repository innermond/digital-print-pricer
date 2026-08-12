import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreviewCard } from './PreviewCard';
import { makeElemental, makeFinishing, makeSticker } from '../test/fixtures';

describe('PreviewCard', () => {
  it('renders nothing without an element', () => {
    const { container } = render(<PreviewCard element={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the element label, size and paper details', () => {
    render(<PreviewCard element={makeElemental()} />);
    expect(screen.getByText('Previzualizare')).toBeInTheDocument();
    expect(screen.getByText('Coală Simplă')).toBeInTheDocument();
    expect(screen.getByText('210.0 × 297.0 mm')).toBeInTheDocument();
    expect(screen.getByText('250 GSM · Gloss')).toBeInTheDocument();
  });

  it('describes sticker media by its face', () => {
    render(<PreviewCard element={makeElemental({ media: makeSticker({ face: 'PVC' }) })} />);
    expect(screen.getByText('Etichetă PVC')).toBeInTheDocument();
  });

  it('applies the rounded-corner classes', () => {
    const element = makeElemental({
      finishing: makeFinishing({ roundedCornes: { corners: [1, 4] } }),
    });
    const { container } = render(<PreviewCard element={element} />);
    const box = container.querySelector('.rounded-tl-xl');
    expect(box).not.toBeNull();
    expect(box).toHaveClass('rounded-br-xl');
  });

  it('shows a lamination badge when the element is laminated', () => {
    const element = makeElemental({
      finishing: makeFinishing({ lamination: { type: 'gloss', sides: 'both' } }),
    });
    render(<PreviewCard element={element} />);
    expect(screen.getByText('Lucios')).toBeInTheDocument();
    expect(screen.getByText('Laminare lucios pe ambele fețe')).toBeInTheDocument();
  });

  it('shows no lamination badge without lamination', () => {
    render(<PreviewCard element={makeElemental()} />);
    expect(screen.queryByText(/Laminare .* pe /)).not.toBeInTheDocument();
  });
});
