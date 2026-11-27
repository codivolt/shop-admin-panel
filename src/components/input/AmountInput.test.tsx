import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import AmountInput from './AmountInput';

describe('AmountInput', () => {
  it('formats the initial numeric value with separators', () => {
    render(<AmountInput value={1234567} onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('1,234,567');
  });

  it('emits a clean number without separators', async () => {
    const onChange = vi.fn();
    render(<AmountInput value={0} onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1,234' } });
    expect(onChange).toHaveBeenLastCalledWith(1234);
  });

  it('shows the error message', () => {
    render(<AmountInput value={0} onChange={() => {}} error="مقدار نامعتبر" />);
    expect(screen.getByText('مقدار نامعتبر')).toBeInTheDocument();
  });
});