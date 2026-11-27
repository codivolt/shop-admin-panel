import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import Form from './Form';

function Harness({ onSubmit }: { onSubmit: (e: { preventDefault: () => void }) => void }) {
  const methods = useForm();
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <button type="submit">ارسال</button>
    </Form>
  );
}

describe('Form', () => {
  it('renders children inside a form and submits', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<Harness onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'ارسال' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});