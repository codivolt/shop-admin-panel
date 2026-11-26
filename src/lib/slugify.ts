const PERSIAN_MAP: Record<string, string> = {
  'ا': 'a',
  'آ': 'aa',
  'أ': 'a',
  'إ': 'e',
  'ب': 'b',
  'پ': 'p',
  'ت': 't',
  'ث': 's',
  'ج': 'j',
  'چ': 'ch',
  'ح': 'h',
  'خ': 'kh',
  'د': 'd',
  'ذ': 'z',
  'ر': 'r',
  'ز': 'z',
  'ژ': 'zh',
  'س': 's',
  'ش': 'sh',
  'ص': 's',
  'ض': 'z',
  'ط': 't',
  'ظ': 'z',
  'ع': 'a',
  'غ': 'gh',
  'ف': 'f',
  'ق': 'gh',
  'ک': 'k',
  'ك': 'k',
  'گ': 'g',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'و': 'v',
  'ؤ': 'o',
  'ه': 'h',
  'ة': 'h',
  'ی': 'y',
  'ي': 'y',
  'ئ': 'y',
};

const PERSIAN_DIGITS: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
};

export function slugify(input: string): string {
  let out = '';
  for (const ch of input.trim().toLowerCase()) {
    if (PERSIAN_MAP[ch] !== undefined) {
      out += PERSIAN_MAP[ch];
    } else if (PERSIAN_DIGITS[ch] !== undefined) {
      out += PERSIAN_DIGITS[ch];
    } else if (/[a-z0-9]/.test(ch)) {
      out += ch;
    } else if (ch === ' ' || ch === '-' || ch === '_' || ch === '\u200c') {
      out += '-';
    }
  }
  return out
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}