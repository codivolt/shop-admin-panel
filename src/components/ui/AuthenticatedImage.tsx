"use client";

import { useEffect, useState } from 'react';
import { api } from '../../services/api';

type AuthenticatedImageProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  onView?: () => void;
  label?: string;
};

export function AuthenticatedImage({
  src,
  alt = 'تصویر',
  className = '',
  width,
  height,
  onView,
  label = 'نمایش تصویر',
}: AuthenticatedImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!src) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setError(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    const normalizedSrc = src.replace('/uploads/receipts/', '/files/receipts/');

    async function fetchImage() {
      try {
        const response = await api.get(normalizedSrc, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        if (!cancelled) {
          setBlobUrl(url);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setBlobUrl(null);
          setLoading(false);
        }
      }
    }

    fetchImage();

    return () => {
      cancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [src]);

  if (!src) return null;

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-rose-600 mt-1">
        <span>عدم امکان نمایش فیش</span>
      </div>
    );
  }

  if (loading && !blobUrl) {
    return (
      <div className="flex h-32 w-48 items-center justify-center rounded-lg border border-dashed border-border bg-stone-50 text-stone-400 text-xs">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="relative inline-block group">
      <img
        src={blobUrl || undefined}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={{
          display: 'block',
          cursor: onView ? 'pointer' : 'default',
        }}
        onClick={() => onView?.()}
      />
      {onView && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none rounded-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-900 hover:bg-stone-100 pointer-events-auto"
            aria-label={label}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
