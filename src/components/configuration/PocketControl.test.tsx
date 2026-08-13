import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PocketControl } from './PocketControl';
import { MOCK_MEDIA } from '../../data/mockData';
import type { Pocket } from '../../types';

const pocket: Pocket = {
  label: 'Buzunar de Hârtie',
  mediaId: 'p6',
  width: 200,
  height: 120,
  unit: 'mm',
  pageCount: 2,
  printing: { front: 'black', back: 'none' },
};

describe('PocketControl', () => {
  it('states what is included when enabled', () => {
    render(<PocketControl pocket={pocket} media={MOCK_MEDIA} enabled onChange={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Buzunar' })).toBeInTheDocument();
    expect(screen.getByText('Buzunar de Hârtie inclus')).toBeInTheDocument();
    expect(screen.getByText('200 × 120 mm')).toBeInTheDocument();
  });

  it('states it is excluded when disabled', () => {
    render(<PocketControl pocket={pocket} media={MOCK_MEDIA} enabled={false} onChange={vi.fn()} />);
    expect(screen.getByText('Buzunar de Hârtie exclus')).toBeInTheDocument();
  });

  it('names the paper it is made from', () => {
    render(<PocketControl pocket={pocket} media={MOCK_MEDIA} enabled onChange={vi.fn()} />);
    const paper = MOCK_MEDIA.find((m) => m.id === 'p6')!;
    expect(screen.getByText(paper.label)).toBeInTheDocument();
  });

  it('omits the paper line when the media is missing from the catalog', () => {
    render(
      <PocketControl pocket={{ ...pocket, mediaId: 'nope' }} media={MOCK_MEDIA} enabled onChange={vi.fn()} />
    );
    expect(screen.getByText('Buzunar de Hârtie inclus')).toBeInTheDocument();
  });

  it('offers a button that reports the pocket is currently on', () => {
    render(<PocketControl pocket={pocket} media={MOCK_MEDIA} enabled onChange={vi.fn()} />);
    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
  });

  it('toggles off when clicked while enabled', async () => {
    const onChange = vi.fn();
    render(<PocketControl pocket={pocket} media={MOCK_MEDIA} enabled onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('toggles on when clicked while disabled', async () => {
    const onChange = vi.fn();
    render(<PocketControl pocket={pocket} media={MOCK_MEDIA} enabled={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
