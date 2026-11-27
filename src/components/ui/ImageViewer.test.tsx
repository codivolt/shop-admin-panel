import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { ImageViewer } from './ImageViewer';

const get = vi.fn();
vi.mock('../../services/api', () => ({
  api: { get: (...args: unknown[]) => get(...args) },
}));

describe('ImageViewer', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ImageViewer open={false} onClose={() => {}} src="/a.png" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('loads the image when opened', async () => {
    get.mockResolvedValue({ data: new ArrayBuffer(8) });
    render(<ImageViewer open onClose={() => {}} src="/uploads/receipts/a.png" title="فیش" />);

    await waitFor(() => expect(screen.getByAltText('فیش')).toBeInTheDocument());
    expect(get).toHaveBeenCalledWith('/files/receipts/a.png', { responseType: 'blob' });
  });

  it('shows an error state when loading fails', async () => {
    get.mockRejectedValue(new Error('boom'));
    render(<ImageViewer open onClose={() => {}} src="/a.png" />);
    await waitFor(() => expect(screen.getByText('عدم امکان نمایش فیش')).toBeInTheDocument());
  });
});