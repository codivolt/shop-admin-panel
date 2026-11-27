import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Button from './Button';

describe('Button', () => {
  it('renders children and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>ثبت</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'ثبت' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows loading label and disables the button', () => {
    render(<Button isLoading>ثبت</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('در حال پردازش');
  });

  it('forwards disabled state', () => {
    render(<Button disabled>ثبت</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});