import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProductImagesField from './ProductImagesField';

const base = {
  imagePreviews: [] as string[],
  displayImages: [] as { id: string; imageUrl: string; isPrimary?: boolean }[],
  galleryUploading: false,
  getAbsoluteImageUrl: (url: string) => url,
  onFileChange: () => {},
  onRemoveNew: () => {},
  onRemoveNewAt: () => {},
  onRemoveMain: () => {},
  onDeleteGallery: () => {},
  onSetPrimary: () => {},
};

describe('ProductImagesField', () => {
  it('shows the empty picker prompt', () => {
    render(<ProductImagesField {...base} />);
    expect(screen.getByText('انتخاب تصویر محصول (چندگانه)')).toBeInTheDocument();
  });

  it('renders existing and new images with a count', () => {
    render(
      <ProductImagesField
        {...base}
        displayImages={[{ id: '1', imageUrl: '/a.webp', isPrimary: true }]}
        imagePreviews={['blob:new']}
      />,
    );
    expect(screen.getByText('2 تصویر')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('deletes a gallery image', async () => {
    const onDeleteGallery = vi.fn();
    render(
      <ProductImagesField
        {...base}
        displayImages={[{ id: '1', imageUrl: '/a.webp' }]}
        onDeleteGallery={onDeleteGallery}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'حذف تصویر' }));
    expect(onDeleteGallery).toHaveBeenCalledWith('1');
  });
});