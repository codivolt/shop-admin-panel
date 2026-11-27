import {
  attributeSchema,
  normalizeOptions,
  parseOptionList,
} from '../../src/lib/category-attributes';

describe('category attribute options', () => {
  it('parses comma separated options', () => {
    expect(parseOptionList(' قرمز, آبی , ')).toEqual(['قرمز', 'آبی']);
  });

  it('parses JSON option lists', () => {
    expect(parseOptionList('["a","b"]')).toEqual(['a', 'b']);
    expect(parseOptionList('[invalid')).toEqual([]);
  });

  it('normalizes options to JSON or null', () => {
    expect(normalizeOptions('a,b')).toBe('["a","b"]');
    expect(normalizeOptions('')).toBeNull();
  });

  it('requires options for select attributes', () => {
    const base = { name: 'رنگ', type: 'select' as const, options: '' };
    expect(attributeSchema.safeParse(base).success).toBe(false);
    expect(attributeSchema.safeParse({ ...base, options: 'قرمز' }).success).toBe(true);
  });

  it('accepts non-select attributes without options', () => {
    expect(attributeSchema.safeParse({ name: 'وزن', type: 'number' }).success).toBe(true);
  });
});