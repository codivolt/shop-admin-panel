import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import JalaliDateSheet from './JalaliDateSheet';

describe('JalaliDateSheet', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <JalaliDateSheet open={false} initial={{ jy: 1403, jm: 1, jd: 1 }} onClose={() => {}} onConfirm={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('confirms the selected date', async () => {
    const onConfirm = vi.fn();
    render(
      <JalaliDateSheet open initial={{ jy: 1403, jm: 1, jd: 1 }} onClose={() => {}} onConfirm={onConfirm} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'تأیید' }));
    expect(onConfirm).toHaveBeenCalledWith({ jy: 1403, jm: 1, jd: 1 });
  });

  it('closes without confirming', async () => {
    const onClose = vi.fn();
    render(
      <JalaliDateSheet open initial={{ jy: 1403, jm: 1, jd: 1 }} onClose={onClose} onConfirm={() => {}} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'لغو' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});