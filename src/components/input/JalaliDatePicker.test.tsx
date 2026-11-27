import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import JalaliDatePicker from './JalaliDatePicker';

describe('JalaliDatePicker', () => {
  it('shows the placeholder and opens the sheet', async () => {
    render(<JalaliDatePicker onChange={() => {}} placeholder="تاریخ را انتخاب کنید" />);
    expect(screen.getByText('تاریخ را انتخاب کنید')).toBeInTheDocument();

    await userEvent.click(screen.getByText('تاریخ را انتخاب کنید'));
    expect(screen.getByText('انتخاب تاریخ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تأیید' })).toBeInTheDocument();
  });

  it('confirms a date and calls onChange', async () => {
    const onChange = vi.fn();
    render(<JalaliDatePicker onChange={onChange} />);
    await userEvent.click(screen.getByText('انتخاب تاریخ'));
    await userEvent.click(screen.getByRole('button', { name: 'تأیید' }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});