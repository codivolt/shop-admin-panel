import jalaliMoment from 'jalali-moment';

jalaliMoment.useJalaliSystemPrimarily();

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export type JalaliParts = { jy: number; jm: number; jd: number };

const pad = (n: number) => String(n).padStart(2, '0');

export function toJalaliParts(gregorian?: string | null): JalaliParts {
  const m = gregorian ? jalaliMoment(new Date(`${gregorian}T00:00:00`)) : jalaliMoment();
  return { jy: m.year(), jm: m.month(), jd: m.date() };
}

export function toGregorianString(jy: number, jm: number, jd: number): string {
  const d = jalaliMoment(`${jy}/${jm + 1}/${jd}`, 'YYYY/MM/DD').toDate();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysInJalaliMonth(jy: number, jm: number): number {
  return jalaliMoment.jDaysInMonth(jy, jm + 1);
}

export function formatJalali(gregorian?: string | null): string {
  return gregorian ? jalaliMoment(new Date(`${gregorian}T00:00:00`)).format('YYYY/MM/DD') : '';
}