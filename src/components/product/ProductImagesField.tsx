import type { ChangeEvent } from 'react';
import Button from '../button/Button';

export type ProductImageItem = {
  id: string;
  imageUrl: string;
  isPrimary?: boolean;
};

type ProductImagesFieldProps = {
  imagePreviews: string[];
  displayImages: ProductImageItem[];
  galleryUploading: boolean;
  getAbsoluteImageUrl: (url: string) => string | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveNew: () => void;
  onRemoveNewAt: (index: number) => void;
  onRemoveMain: () => void;
  onDeleteGallery: (id: string) => void;
  onSetPrimary: (id: string) => void;
};

export default function ProductImagesField({
  imagePreviews,
  displayImages,
  galleryUploading,
  getAbsoluteImageUrl,
  onFileChange,
  onRemoveNew,
  onRemoveNewAt,
  onRemoveMain,
  onDeleteGallery,
  onSetPrimary,
}: ProductImagesFieldProps) {
  const hasImages = imagePreviews.length > 0 || displayImages.length > 0;
  const openPicker = () => document.getElementById('product-image-input')?.click();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-fg">تصویر محصول</h2>
        {imagePreviews.length > 0 && (
          <Button variant="outline" size="sm" onClick={onRemoveNew}>
            حذف تصاویر جدید
          </Button>
        )}
      </div>
      <div
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all ${
          hasImages
            ? 'border-border-strong bg-primary/10'
            : 'border-border bg-surface-2 hover:border-primary hover:bg-surface-2'
        } cursor-pointer`}
        onClick={openPicker}
      >
        <input
          id="product-image-input"
          type="file"
          accept="image/*"
          multiple
          onChange={onFileChange}
          className="hidden"
        />
        {hasImages ? (
          <div className="w-full">
            <div className="flex flex-wrap justify-center gap-3">
              {displayImages.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={getAbsoluteImageUrl(img.imageUrl) ?? ''}
                    alt={`Gallery ${img.id}`}
                    className="w-24 h-24 object-cover rounded-xl shadow-md"
                  />
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      if (img.id === 'main') onRemoveMain();
                      else onDeleteGallery(img.id);
                    }}
                    className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700"
                    aria-label="حذف تصویر"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {img.id !== 'main' && !img.isPrimary ? (
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onSetPrimary(img.id);
                      }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded hover:bg-black/80 whitespace-nowrap"
                    >
                      اصلی
                    </button>
                  ) : (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-green-300 bg-green-900/70 px-1.5 py-0.5 rounded whitespace-nowrap">
                      اصلی
                    </span>
                  )}
                </div>
              ))}
              {imagePreviews.map((src, idx) => (
                <div key={`new-${idx}`} className="relative">
                  <img
                    src={src}
                    alt={`پیش نمایش ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-xl shadow-md"
                  />
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onRemoveNewAt(idx);
                    }}
                    className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700"
                    aria-label="حذف تصویر"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  openPicker();
                }}
                disabled={galleryUploading}
                className="flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
              >
                {galleryUploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                ) : (
                  <>
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-[11px] font-medium">افزودن</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 text-sm font-medium text-primary">
              {displayImages.length + imagePreviews.length} تصویر
            </div>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-sm font-medium text-muted-soft">انتخاب تصویر محصول (چندگانه)</div>
            <p className="text-xs text-muted mt-1">
              فرمت‌های پشتیبانی شده: JPG, PNG, WEBP — حداکثر 2 مگابایت برای هر تصویر
            </p>
          </>
        )}
      </div>
    </div>
  );
}