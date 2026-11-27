import {
  daysInJalaliMonth,
  formatJalali,
  toGregorianString,
  toJalaliParts,
} from '../../src/lib/jalali';

describe('jalali conversion', () => {
  it('converts a known gregorian date', () => {
    expect(toJalaliParts('2024-03-20')).toEqual({ jy: 1403, jm: 0, jd: 1 });
  });

  it('round-trips through gregorian', () => {
    const parts = { jy: 1403, jm: 0, jd: 1 };
    expect(toJalaliParts(toGregorianString(parts.jy, parts.jm, parts.jd))).toEqual(parts);
  });

  it('reports month lengths', () => {
    expect(daysInJalaliMonth(1403, 1)).toBe(31);
    expect(daysInJalaliMonth(1403, 7)).toBe(30);
  });

  it('formats dates in Persian', () => {
    expect(formatJalali('2024-03-20')).toBe('1403/01/01');
  });
});