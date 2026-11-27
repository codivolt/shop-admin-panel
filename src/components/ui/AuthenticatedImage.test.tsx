import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { AuthenticatedImage } from './AuthenticatedImage';

const get = vi.fn();
vi.mock('../../services/api', () => ({
  api: { get: (...args: unknown[]) => get(...args) },
}));

describe('AuthenticatedImage', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('renders nothing without a source', () => {
    const { container } = render(<AuthenticatedImage src={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('loads a blob image and normalizes receipt paths', async () => {
    get.mockResolvedValue({ data: new ArrayBuffer(8) });
    render(<AuthenticatedImage src="/uploads/receipts/a.png" alt="فیش" />);

    await waitFor(() => expect(screen.getByAltText('فیش')).toBeInTheDocument());
    expect(get).toHaveBeenCalledWith('/files/receipts/a.png', { responseType: 'blob' });
  });

  it('shows an error when loading fails', async () => {
    get.mockRejectedValue(new Error('boom'));
    render(<AuthenticatedImage src="/files/receipts/a.png" />);
    await waitFor(() => expect(screen.getByText('عدم امکان نمایش فیش')).toBeInTheDocument());
  });
});