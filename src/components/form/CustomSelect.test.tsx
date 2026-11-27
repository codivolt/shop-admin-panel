import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CustomSelect from './CustomSelect';

const options = [
  { value: 'a', label: 'گزینه الف' },
  { value: 'b', label: 'گزینه ب' },
];

describe('CustomSelect', () => {
  it('opens the dropdown and selects an option', async () => {
    const onChange = vi.fn();
    render(<CustomSelect options={options} onChange={onChange} />);

    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('option', { name: 'گزینه ب' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('shows the placeholder when no value is selected', () => {
    render(<CustomSelect options={options} placeholder="انتخاب کنید" />);
    expect(screen.getByText('انتخاب کنید')).toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    render(<CustomSelect options={options} disabled />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});