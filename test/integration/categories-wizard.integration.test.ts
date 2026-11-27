import { categorySchema } from '../../src/lib/categories-wizard';

describe('category wizard schema', () => {
  it('requires a name', () => {
    expect(categorySchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('accepts a minimal category', () => {
    const result = categorySchema.safeParse({ name: 'دسته تست' });
    expect(result.success).toBe(true);
  });

  it('keeps optional fields', () => {
    const result = categorySchema.parse({
      name: 'دسته تست',
      description: 'توضیح',
      isActive: false,
    });
    expect(result).toEqual({ name: 'دسته تست', description: 'توضیح', isActive: false });
  });
});