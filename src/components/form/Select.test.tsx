import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Select from './Select';

describe('Select', () => {
  it('renders options and propagates selection', async () => {
    const onChange = vi.fn();
    render(
      <Select label="وضعیت" value="a" onChange={onChange}>
        <option value="a">فعال</option>
        <option value="b">غیرفعال</option>
      </Select>,
    );
    expect(screen.getByRole('combobox')).toHaveValue('a');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows the error message', () => {
    render(
      <Select label="وضعیت" error="انتخاب کنید">
        <option value="a">فعال</option>
      </Select>,
    );
    expect(screen.getByText('انتخاب کنید')).toBeInTheDocument();
  });
});