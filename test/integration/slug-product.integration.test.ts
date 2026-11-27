import { slugify } from '../../src/lib/slugify';
import { productSchema } from '../../src/lib/product-schema';

describe('slug + product schema integration', () => {
  it('transliterates Persian names into slugs', () => {
    expect(slugify('توتون خشک')).toBe('tvtvn-khshk');
    expect(slugify('کاغذ رول')).toBe('kaghz-rvl');
  });

  it('cleans punctuation and spacing', () => {
    expect(slugify('  A  B!!  ')).toBe('a-b');
  });

  it('validates a product built from a generated slug', () => {
    const result = productSchema.safeParse({
      name: 'توتون خشک',
      slug: slugify('توتون خشک'),
      price: 1000,
      description: '',
      categoryId: 'c1',
      isActive: true,
      stock: 5,
    });
    expect(result.success).toBe(true);
  });
});