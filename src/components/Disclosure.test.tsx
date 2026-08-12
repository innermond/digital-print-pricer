import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Disclosure } from './Disclosure';

describe('Disclosure', () => {
  it('starts closed and toggles', async () => {
    const user = userEvent.setup();
    render(<Disclosure label="Opțiuni avansate"><p>conținut</p></Disclosure>);

    const toggle = screen.getByRole('button', { name: /Opțiuni avansate/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('conținut')).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('conținut')).toBeInTheDocument();
  });

  it('starts open when something inside diverges from the default', () => {
    render(
      <Disclosure label="Opțiuni avansate" chips={['Laminare: Mat']}>
        <p>conținut</p>
      </Disclosure>
    );
    expect(screen.getByRole('button', { name: /Opțiuni avansate/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByText('conținut')).toBeInTheDocument();
  });

  it('shows the changed values as chips once collapsed', async () => {
    const user = userEvent.setup();
    render(
      <Disclosure label="Opțiuni avansate" chips={['Laminare: Mat', 'Biguitură: 2']}>
        <p>conținut</p>
      </Disclosure>
    );

    // Open: the controls speak for themselves, so no chips.
    expect(screen.queryByText('Laminare: Mat')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Opțiuni avansate/ }));
    // Collapsed: the settings stay on screen even though the controls are gone.
    expect(screen.getByText('Laminare: Mat')).toBeInTheDocument();
    expect(screen.getByText('Biguitură: 2')).toBeInTheDocument();
    expect(screen.queryByText('conținut')).not.toBeInTheDocument();
  });

  it('re-opens when the context switches to a diverging one', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Disclosure label="Opțiuni avansate" resetKey="a"><p>conținut</p></Disclosure>
    );
    const toggle = screen.getByRole('button', { name: /Opțiuni avansate/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Switching to a clean element collapses it again...
    rerender(<Disclosure label="Opțiuni avansate" resetKey="b"><p>conținut</p></Disclosure>);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // ...and switching to one with changes opens it.
    rerender(
      <Disclosure label="Opțiuni avansate" resetKey="c" chips={['Pliere: Z']}>
        <p>conținut</p>
      </Disclosure>
    );
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
