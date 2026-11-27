import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Modal from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={() => {}} title="عنوان">
        محتوا
      </Modal>,
    );
    expect(screen.queryByText('محتوا')).not.toBeInTheDocument();
  });

  it('renders the title and children when open', () => {
    render(
      <Modal open onClose={() => {}} title="عنوان">
        محتوا
      </Modal>,
    );
    expect(screen.getByText('عنوان')).toBeInTheDocument();
    expect(screen.getByText('محتوا')).toBeInTheDocument();
  });

  it('closes from the header button', async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="عنوان">
        محتوا
      </Modal>,
    );
    await userEvent.click(screen.getAllByRole('button')[0]);
    expect(onClose).toHaveBeenCalledOnce();
  });
});