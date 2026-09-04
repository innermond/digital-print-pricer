import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PreviewCard } from './PreviewCard';
import { makeElemental, makeFinishing, makeSize, makeSpecial, makeSticker } from '../test/fixtures';
import type { Pocket } from '../types';

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

  // The caption arm tested for 'paper', so a special fell into the sticker arm and read a
  // `face` it does not have: the card said "Etichetă undefined".
  it('describes a special stock by its gsm and finish, not as a sticker', () => {
    render(<PreviewCard element={makeElemental({ media: makeSpecial() })} />);
    expect(screen.getByText('300 GSM · Matt')).toBeInTheDocument();
    expect(screen.queryByText(/Etichetă/)).not.toBeInTheDocument();
  });

  it('rounds the corners the element asks for, and only those', () => {
    // The sheet is an SVG path now, so the radii are arcs in `d` rather than
    // Tailwind classes: two corners rounded means two arcs.
    const element = makeElemental({
      finishing: makeFinishing({ roundedCornes: { corners: [1, 4] } }),
    });
    const { container } = render(<PreviewCard element={element} />);
    const sheet = container.querySelector('svg path');
    expect(sheet?.getAttribute('d')?.match(/A /g)).toHaveLength(2);

    const { container: square } = render(<PreviewCard element={makeElemental()} />);
    expect(square.querySelector('svg path')?.getAttribute('d')).not.toContain('A ');
  });

  it('names the drawing after what it depicts', () => {
    render(<PreviewCard element={makeElemental()} />);
    expect(screen.getByRole('img', { name: 'Coală Simplă, 210.0 × 297.0 mm' })).toBeInTheDocument();
  });

  it('names the format in the caption when it knows the presets', () => {
    const landscapeA4 = makeSize({ width: 297, height: 210, widthMm: 297, heightMm: 210 });
    render(<PreviewCard element={makeElemental({ size: landscapeA4 })} presets={[makeSize()]} />);
    expect(screen.getByText('A4 orizontal · 297.0 × 210.0 mm')).toBeInTheDocument();
  });

  it('draws the fold lines of a folded sheet', () => {
    const element = makeElemental({
      finishing: makeFinishing({ folding: { type: 'tri-fold', folds: 2 } }),
    });
    render(<PreviewCard element={element} />);
    expect(screen.getAllByTestId('preview-fold')).toHaveLength(2);
  });

  it('draws the product-level features it is given', () => {
    const pocket: Pocket = {
      label: 'Buzunar', mediaId: 'p5', width: 210, height: 100, unit: 'mm',
      pageCount: 2, printing: { front: 'none', back: 'none' },
    };
    render(
      <PreviewCard
        element={makeElemental()}
        binding={{ type: 'spiral', color: 'black' }}
        pocket={pocket}
        punchHole
      />
    );
    expect(screen.getByTestId('preview-spiral')).toBeInTheDocument();
    expect(screen.getByTestId('preview-pocket')).toBeInTheDocument();
    expect(screen.getByTestId('preview-hole')).toBeInTheDocument();
  });

  it('keeps a folder\'s pocket off the fold, on the panel it is glued to', () => {
    const pocket: Pocket = {
      label: 'Buzunar', mediaId: 'p5', width: 200, height: 120, unit: 'mm',
      pageCount: 2, printing: { front: 'none', back: 'none' },
    };
    const { container } = render(
      <PreviewCard
        element={makeElemental({ finishing: makeFinishing({ creasing: { count: 2 } }) })}
        pocket={pocket}
        foldedInHalf
      />
    );
    // The open A3 sheet is 420 wide, so the band starts at the right-hand crease
    // rather than at the left edge of the sheet.
    const band = container.querySelector('[data-testid="preview-pocket"]');
    expect(band?.getAttribute('d')).toMatch(/^M 215/);
  });

  it('runs a hanging product\'s coil across the top, not down the side', () => {
    const { container } = render(
      <PreviewCard
        element={makeElemental()}
        binding={{ type: 'spiral', color: 'white' }}
        punchHole
      />
    );
    // A top coil sweeps out of negative y; a side coil sweeps out of negative x.
    const loop = container.querySelector('[data-testid="preview-spiral"] path');
    expect(loop?.getAttribute('d')).toMatch(/^M [\d.]+ -\d/);
  });

  it('runs a side-bound coil down the left edge', () => {
    const { container } = render(
      <PreviewCard element={makeElemental()} binding={{ type: 'spiral', color: 'white' }} />
    );
    const loop = container.querySelector('[data-testid="preview-spiral"] path');
    expect(loop?.getAttribute('d')).toMatch(/^M -\d/);
  });

  it('draws none of them for a plain sheet', () => {
    render(<PreviewCard element={makeElemental()} />);
    expect(screen.queryByTestId('preview-spiral')).not.toBeInTheDocument();
    expect(screen.queryByTestId('preview-pocket')).not.toBeInTheDocument();
    expect(screen.queryByTestId('preview-hole')).not.toBeInTheDocument();
  });

  it('shows a lamination badge when the element is laminated', () => {
    const element = makeElemental({
      finishing: makeFinishing({ lamination: { type: 'gloss', sides: 'both' } }),
    });
    render(<PreviewCard element={element} />);
    expect(screen.getByText('Lucios')).toBeInTheDocument();
    // The panel is only in the DOM while the badge is open — it used to be mounted
    // permanently and hidden, which cost layout and overflowed narrow viewports.
    fireEvent.mouseEnter(screen.getByText('Lucios'));
    expect(screen.getByText('Laminare lucios pe ambele fețe')).toBeInTheDocument();
  });

  it('shows no lamination badge without lamination', () => {
    render(<PreviewCard element={makeElemental()} />);
    expect(screen.queryByText(/Laminare .* pe /)).not.toBeInTheDocument();
  });
});
