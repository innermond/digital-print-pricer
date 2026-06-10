import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its children', () => {
    render(
      <Badge text="info text">
        <button>child content</button>
      </Badge>,
    );
    expect(screen.getByRole('button', { name: 'child content' })).toBeInTheDocument();
  });

  it('shows the default ⓘ label when no label is given', () => {
    render(<Badge text="info text">child</Badge>);
    expect(screen.getByText('ⓘ')).toBeInTheDocument();
  });

  it('shows a custom label instead of the default', () => {
    render(
      <Badge text="info text" label="42">
        child
      </Badge>,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByText('ⓘ')).not.toBeInTheDocument();
  });

  it('renders the text as HTML inside the panel', () => {
    render(<Badge text="plain <strong>bold</strong>">child</Badge>);
    expect(screen.getByText('bold').tagName).toBe('STRONG');
  });

  it('keeps the panel invisible until the badge is hovered', () => {
    render(<Badge text="panel text">child</Badge>);
    const panel = screen.getByText('panel text');
    expect(panel).toHaveClass('invisible');

    fireEvent.mouseEnter(screen.getByText('ⓘ'));
    expect(panel).not.toHaveClass('invisible');

    fireEvent.mouseLeave(screen.getByText('ⓘ'));
    expect(panel).toHaveClass('invisible');
  });

  it('caps the panel width at 300px', () => {
    // jsdom reports a 0-wide viewport; pretend the window is 1024px wide
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);

    render(<Badge text="panel text">child</Badge>);
    const panel = screen.getByText('panel text');
    expect(panel).toHaveClass('max-w-[300px]');

    fireEvent.mouseEnter(screen.getByText('ⓘ'));
    expect(panel.style.maxWidth).toBe('300px');
  });
});
