import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Input from './Input';

describe('Input', () => {
  it('renders a controlled value and propagates changes', async () => {
    const onChange = vi.fn();
    render(<Input name="title" label="عنوان" value="سلام" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('سلام');
    await userEvent.type(input, 'ی');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows a custom error message', () => {
    render(<Input name="title" label="عنوان" error="الزامی است" />);
    expect(screen.getByText('الزامی است')).toBeInTheDocument();
  });

  it('marks required fields with an asterisk', () => {
    render(<Input name="title" label="عنوان" required />);
    expect(screen.getByText('عنوان *')).toBeInTheDocument();
  });
});