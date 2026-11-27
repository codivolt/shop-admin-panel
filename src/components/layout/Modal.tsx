import { useEffect, useState, type ReactNode } from 'react';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const sizeMap: Record<string, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
  size = 'md',
}: ModalProps) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className={`fixed inset-0 bg-[var(--overlay)] backdrop-blur-md transition-opacity duration-300 ${
          closing ? 'opacity-0' : 'opacity-100'
        }`}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />
      <div
        className={`modal-panel relative z-10 w-full transform opacity-0 transition-all duration-300 ${sizeMap[size]} ${
          closing ? 'modal-closing' : ''
        } ${className || ''}`}
        style={{ animation: 'popIn 0.2s ease-out forwards' }}
      >
        <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl">
          {title && (
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6 sm:py-4">
              <h2 className="truncate text-base font-bold tracking-tight text-fg sm:text-lg">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-surface-2 hover:text-fg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}