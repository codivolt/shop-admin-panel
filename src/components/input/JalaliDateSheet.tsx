import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import jalaliMoment from 'jalali-moment';
import { JALALI_MONTHS, daysInJalaliMonth, type JalaliParts } from '../../lib/jalali';

const ITEM_HEIGHT = 40;
const VISIBLE = 5;
const PAD = (ITEM_HEIGHT * (VISIBLE - 1)) / 2;

type WheelProps = {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

function Wheel({ items, selectedIndex, onSelect }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(selectedIndex);

  useEffect(() => {
    setActive(selectedIndex);
    if (ref.current) ref.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, items.length]);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    const index = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_HEIGHT)));
    if (index !== active) setActive(index);
    if (endTimer.current) clearTimeout(endTimer.current);
    endTimer.current = setTimeout(() => onSelect(index), 100);
  };

  return (
    <div className="relative min-w-0 flex-1">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="relative z-10 overflow-y-auto overflow-x-hidden overscroll-contain text-center"
        style={{
          height: ITEM_HEIGHT * VISIBLE,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'y mandatory',
        }}
      >
        <div style={{ height: PAD }} />
        {items.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className={`flex items-center justify-center transition-all duration-150 ${
              i === active ? 'scale-110 text-base font-bold text-primary' : 'scale-100 text-sm text-muted'
            }`}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
          >
            {item}
          </div>
        ))}
        <div style={{ height: PAD }} />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-surface-2 via-surface-2/80 to-transparent"
        style={{ height: PAD }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-surface-2 via-surface-2/80 to-transparent"
        style={{ height: PAD }}
      />
    </div>
  );
}

type JalaliDateSheetProps = {
  open: boolean;
  initial: JalaliParts;
  onClose: () => void;
  onConfirm: (parts: JalaliParts) => void;
};

export default function JalaliDateSheet({ open, initial, onClose, onConfirm }: JalaliDateSheetProps) {
  const [jy, setJy] = useState(initial.jy);
  const [jm, setJm] = useState(initial.jm);
  const [jd, setJd] = useState(initial.jd);

  useEffect(() => {
    if (open) {
      setJy(initial.jy);
      setJm(initial.jm);
      setJd(initial.jd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const currentYear = jalaliMoment().year();
  const years = useMemo(
    () => Array.from({ length: 21 }, (_, i) => currentYear - 10 + i),
    [currentYear],
  );
  const days = useMemo(() => daysInJalaliMonth(jy, jm), [jy, jm]);

  useEffect(() => {
    if (jd > days) setJd(days);
  }, [days, jd]);

  if (!open) return null;

  const confirm = () => {
    onConfirm({ jy, jm, jd });
    onClose();
  };

  return createPortal(
    <div dir="rtl" className="fixed inset-0 z-[1100] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-t-3xl border border-border bg-surface p-4 pb-6 shadow-2xl animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-fg">
            لغو
          </button>
          <span className="text-sm font-bold text-fg">انتخاب تاریخ</span>
          <button type="button" onClick={confirm} className="rounded-lg px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary/10">
            تأیید
          </button>
        </div>

        <div className="relative flex gap-2 rounded-2xl bg-surface-2 p-2">
          <div className="pointer-events-none absolute inset-x-2 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-primary/10" />
          <Wheel
            items={years.map((y) => y.toLocaleString('fa-IR', { useGrouping: false }))}
            selectedIndex={years.indexOf(jy)}
            onSelect={(i) => setJy(years[i])}
          />
          <Wheel items={JALALI_MONTHS} selectedIndex={jm} onSelect={(i) => setJm(i)} />
          <Wheel
            items={Array.from({ length: days }, (_, i) => (i + 1).toLocaleString('fa-IR'))}
            selectedIndex={jd - 1}
            onSelect={(i) => setJd(i + 1)}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}