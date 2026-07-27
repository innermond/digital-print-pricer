import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  it('states what is included', () => {
    render(<PocketControl pocket={pocket} media={MOCK_MEDIA} />);
    expect(screen.getByRole('heading', { name: 'Buzunar' })).toBeInTheDocument();
    expect(screen.getByText('Buzunar de Hârtie inclus')).toBeInTheDocument();
    expect(screen.getByText('200 × 120 mm')).toBeInTheDocument();
  });

  it('names the paper it is made from', () => {
    render(<PocketControl pocket={pocket} media={MOCK_MEDIA} />);
    const paper = MOCK_MEDIA.find((m) => m.id === 'p6')!;
    expect(screen.getByText(paper.label)).toBeInTheDocument();
  });

  it('offers nothing to change', () => {
    render(<PocketControl pocket={pocket} media={MOCK_MEDIA} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('omits the paper line when the media is missing from the catalog', () => {
    render(<PocketControl pocket={{ ...pocket, mediaId: 'nope' }} media={MOCK_MEDIA} />);
    expect(screen.getByText('Buzunar de Hârtie inclus')).toBeInTheDocument();
  });
});
