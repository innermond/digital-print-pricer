import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaSelector } from './MediaSelector';
import { makePaper, makeSticker } from '../../test/fixtures';
import type { Media } from '../../types';

const paper = makePaper({ id: 'p2', label: '120 GSM - Lucios', gsm: 120, finish: 'Gloss' });
const sticker = makeSticker({ id: 'p7', label: 'Etichetă Lucioasă Albă', face: 'Gloss' });
const media: Media[] = [paper, sticker];

describe('MediaSelector', () => {
  it('renders every media option with its sub-label', () => {
    render(<MediaSelector media={media} selectedId="p2" recommendedId="p2" onSelect={() => {}} />);
    expect(screen.getByText('120 GSM - Lucios')).toBeInTheDocument();
    expect(screen.getByText('120 GSM · Gloss')).toBeInTheDocument();
    expect(screen.getByText('Etichetă Lucioasă Albă')).toBeInTheDocument();
    expect(screen.getByText('Față lucioasă')).toBeInTheDocument();
  });

  it('marks the recommended media with a star', () => {
    render(<MediaSelector media={media} selectedId="p2" recommendedId="p7" onSelect={() => {}} />);
    const recommended = screen.getByText('Etichetă Lucioasă Albă').closest('button')!;
    expect(recommended).toHaveTextContent('⭐');
    const other = screen.getByText('120 GSM - Lucios').closest('button')!;
    expect(other).not.toHaveTextContent('⭐');
  });

  it('highlights the selected media', () => {
    render(<MediaSelector media={media} selectedId="p2" recommendedId="p2" onSelect={() => {}} />);
    expect(screen.getByText('120 GSM - Lucios').closest('button')).toHaveClass('border-blue-400');
    expect(screen.getByText('Etichetă Lucioasă Albă').closest('button')).not.toHaveClass('border-blue-400');
  });

  it('reports the clicked media', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MediaSelector media={media} selectedId="p2" recommendedId="p2" onSelect={onSelect} />);

    await user.click(screen.getByText('Etichetă Lucioasă Albă'));
    expect(onSelect).toHaveBeenCalledWith(sticker);
  });

  it('wraps options that have an explanation in a Badge', () => {
    const explained = makePaper({ id: 'p3', label: '150 GSM - Mat', explanation: 'hârtie mată' });
    render(<MediaSelector media={[explained]} selectedId="p3" recommendedId="p3" onSelect={() => {}} />);
    expect(screen.getByText('hârtie mată')).toBeInTheDocument();
  });
});
