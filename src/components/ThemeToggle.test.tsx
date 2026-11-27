import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '../theme/ThemeProvider';

describe('ThemeToggle', () => {
  it('toggles the theme when clicked', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'تغییر به حالت روشن');

    await userEvent.click(button);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'تغییر به حالت تاریک');
  });
});