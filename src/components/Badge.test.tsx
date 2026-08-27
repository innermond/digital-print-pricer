import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('does not stretch its wrapper to fill a flex row by default', () => {
    const { container } = render(
      <Badge text="info text">
        <button>child</button>
      </Badge>,
    );
    expect(container.firstChild).not.toHaveClass('flex-grow');
  });

  it('stretches its wrapper when grow is set, to match a row-filling child', () => {
    const { container } = render(
      <Badge text="info text" grow>
        <button>child</button>
      </Badge>,
    );
    expect(container.firstChild).toHaveClass('flex-grow', 'flex-shrink');
  });

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
    fireEvent.mouseEnter(screen.getByText('ⓘ'));
    expect(screen.getByText('bold').tagName).toBe('STRONG');
  });

  // The panel used to live in the DOM permanently, hidden with `visibility: hidden` so
  // that the positioning code could measure it. A visibility-hidden box still occupies
  // layout, so a `w-max` panel sitting at its unpositioned spot hung past the right edge
  // of the page: a screen with 17 badges stretched a 375px phone viewport to 476px and
  // gave the whole site a horizontal scrollbar. Nothing may render until it is asked for.
  it('renders no panel at all until the badge is hovered', () => {
    render(<Badge text="panel text">child</Badge>);
    expect(screen.queryByText('panel text')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByText('ⓘ'));
    expect(screen.getByText('panel text')).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByText('ⓘ'));
    expect(screen.queryByText('panel text')).not.toBeInTheDocument();
  });

  // Tap-to-pin is the only way to reach the help on a touch device, where there is no
  // hover to hold the panel open.
  it('keeps a pinned panel open after the pointer leaves', () => {
    render(<Badge text="panel text">child</Badge>);
    fireEvent.click(screen.getByText('ⓘ'));
    expect(screen.getByText('panel text')).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByText('ⓘ'));
    expect(screen.getByText('panel text')).toBeInTheDocument();

    fireEvent.click(screen.getByText('ⓘ'));
    expect(screen.queryByText('panel text')).not.toBeInTheDocument();
  });

  it('caps the panel width at 300px', () => {
    // jsdom reports a 0-wide viewport; pretend the window is 1024px wide
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);

    render(<Badge text="panel text">child</Badge>);
    fireEvent.mouseEnter(screen.getByText('ⓘ'));

    const panel = screen.getByText('panel text');
    expect(panel).toHaveClass('max-w-[300px]');
    expect(panel.style.maxWidth).toBe('300px');
  });
});
