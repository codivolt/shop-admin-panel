import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmDeleteModal from './ConfirmDeleteModal';

describe('ConfirmDeleteModal', () => {
  it('renders the message and handles confirm', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDeleteModal
        open
        message="از حذف مطمئنید؟"
        onCancel={() => {}}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByText('از حذف مطمئنید؟')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'حذف' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('handles cancel', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDeleteModal open message="مطمئنید؟" onCancel={onCancel} onConfirm={() => {}} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'انصراف' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});