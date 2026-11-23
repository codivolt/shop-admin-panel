import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import Input from '../../components/input/Input';
import Button from '../../components/button/Button';
import Card from '../../components/layout/Card';
import CustomSelect from '../../components/form/CustomSelect';
import Modal from '../../components/layout/Modal';
import toast from 'react-hot-toast';

import Breadcrumb from '../../components/layout/Breadcrumb';
const productSchema = z.object({
  name: z.string().min(1, 'نام محصول الزامی است'),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  stock: z.coerce.number().min(0, 'موجودی نمی‌تواند منفی باشد').optional(),
  sku: z.string().optional(),
  categoryId: z.string().min(1, 'انتخاب دسته-building الزامی است'),
  brandId: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface CategoryAttribute {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  options: string | null;
  isRequired: boolean;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string | null;
  categoryId: string;
  brandId: string | null;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductAttributeValue {
  id: string;
  productId: string;
  attributeId: string;
  value: string;
  createdAt: string;
}

export default function ProductEditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof productSchema>, any, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      stock: 0,
      sku: '',
      categoryId: '',
      brandId: '',
      isActive: true,
    },
  });

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get<Product>(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['productCategories'],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { limit: 100 } });
      return res.data.data;
    },
  });

  const { data: brands, isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ['productBrands'],
    queryFn: async () => {
      const res = await api.get('/brands', { params: { limit: 100 } });
      return res.data.data;
    },
  });

  const { data: attributeValuesData } =
    useQuery<ProductAttributeValue[]>({
      queryKey: ['productAttributeValues', id],
      queryFn: async () => {
        const res = await api.get<ProductAttributeValue[]>(
          `/products/${id}/attribute-values`
        );
        return res.data;
      },
      enabled: !!id,
    });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        slug: product.slug || '',
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        sku: product.sku || '',
        categoryId: product.categoryId,
        brandId: product.brandId || '',
        isActive: product.isActive,
      });
      setSelectedCategoryId(product.categoryId);
      setSelectedBrandId(product.brandId || '');
      setImagePreview(product.imageUrl || null);
    }
  }, [product, reset]);

  useEffect(() => {
    if (selectedCategoryId) {
      api
        .get<CategoryAttribute[]>(`/categories/${selectedCategoryId}/attributes`)
        .then((res) => {
          setAttributes(res.data);
          const newValues: Record<string, string> = {};
          res.data.forEach((attr) => {
            const existing = attributeValuesData?.find(
              (av) => av.attributeId === attr.id
            );
            newValues[attr.id] = existing?.value || '';
          });
          setAttributeValues(newValues);
        })
        .catch(() => {
          setAttributes([]);
          setAttributeValues({});
        });
    } else {
      setAttributes([]);
      setAttributeValues({});
    }
  }, [selectedCategoryId, attributeValuesData]);

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const res = await api.put(`/products/${id}`, data);
      return res.data;
    },
    onSuccess: (updatedProduct) => {
      const savePromises = Object.entries(attributeValues).map(
        ([attributeId, value]) => {
          if (value.trim()) {
            return api.post(`/products/${updatedProduct.id}/attribute-values`, {
              attributeId,
              value,
            });
          }
          return Promise.resolve();
        }
      );

      Promise.all(savePromises).then(() => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['product', id] });
        toast.success('محصول با موفقیت بروزرسانی شد');
        navigate('/products');
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی محصول');
    },
  });

  const handleSubmitForm = (data: ProductFormData) => {
    updateProductMutation.mutate(data);
  };

  const handleAttributeChange = (attributeId: string, value: string) => {
    setAttributeValues((prev) => ({ ...prev, [attributeId]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویر انتخاب کنید');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageModalOpen(true);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageModalOpen(false);
  };

  if (!id || productLoading || categoriesLoading || brandsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    navigate('/products');
    return null;
  }

  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">ویرایش محصول</h1>
          <p className="text-muted text-sm">
            اطلاعات محصول را بروزرسانی کنید
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/products">
            <Button variant="outline">بازگشت به لیست محصولات</Button>
          </Link>
          <Button variant="outline" onClick={() => navigate(`/products/${id}`)}>
            مشاهده محصول
          </Button>
        </div>
      </div>

      <Card padding="md" radius="lg" border="neutral-200">
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-8">

          {/* Image Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-fg">تصویر محصول</h2>
              {imageFile && (
                <Button variant="outline" size="sm" onClick={removeImage}>
                  حذف تصویر
                </Button>
              )}
            </div>
            <div
              className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all ${
                imageFile || imagePreview
                  ? 'border-border-strong bg-primary/10'
                    : 'border-border bg-surface-2 hover:border-primary hover:bg-surface-2'
              } cursor-pointer`}
              onClick={() => document.getElementById('product-image-input')?.click()}
            >
              <input
                id="product-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="پیش نمایش"
                    className="w-32 h-32 object-cover rounded-xl shadow-md"
                  />
                  <div className="mt-3 text-sm font-medium text-primary">
                    تصویر انتخاب شده
                  </div>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-sm font-medium text-muted-soft">
                    انتخاب تصویر محصول
                  </div>
                  <p className="text-xs text-muted mt-1">
                    فرمت‌هایupported: JPG, PNG, WEBP
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Input
                name="name"
                label="نام محصول *"
                placeholder="معمولاً توتون خشک"
                required
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="slug"
                label="نامک (Slug)"
                placeholder="toton-khoshk"
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="price"
                label="قیمت (تومان) *"
                type="number"
                required
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="stock"
                label="موجودی"
                type="number"
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="sku"
                label="کد محصول (SKU)"
                placeholder="SKU-123"
                methods={{
                  register,
                  formState: { errors },
                } as any}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="block text-sm font-medium text-fg-soft">
                توضیحات
              </div>
              <textarea
                {...register('description')}
                placeholder="توضیحات محصول"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border bg-surface text-fg focus:ring-2 focus:border-transparent outline-none transition-all border-border focus:ring-primary"
              />
              {errors.description && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-fg-soft">
              دسته-building *
            </label>
            <CustomSelect
              options={categories?.map((cat) => ({ value: cat.id, label: cat.name })) ?? []}
              value={selectedCategoryId}
              onChange={(val) => {
                setValue('categoryId', val as string);
                setSelectedCategoryId(val as string);
              }}
              label="دسته-building"
              required
              error={errors.categoryId?.message}
            />
            {errors.categoryId && (
              <p className="text-red-500 text-sm font-medium">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Brand Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-fg-soft">
              برند
            </label>
            <CustomSelect
              options={brands?.map((b) => ({ value: b.id, label: b.name })) ?? []}
              value={selectedBrandId || ''}
              onChange={(val) => {
                setValue('brandId', val as string);
                setSelectedBrandId(val as string);
              }}
              label="برند"
              error={errors.brandId?.message}
            />
          </div>

          {/* Dynamic Attributes */}
          {selectedCategoryId && attributes.length > 0 && (
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-fg">ویژگاهاً دسته-building</h3>
                <p className="text-xs text-muted">
                  ویژگی‌های تعریف شده برای این دسته-building
                </p>
              </div>
              <div className="space-y-4">
                {attributes.map((attr) => {
                  const isSelect = attr.type === 'select';
                  const options = attr.options ? JSON.parse(attr.options) : [];
                  return (
                    <div
                      key={attr.id}
                      className={`p-4 rounded-xl border ${
                        attr.isRequired
                          ? 'border-border-strong bg-primary/10/40'
                          : 'border-border bg-surface-2/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-fg">
                          {attr.name}
                        </label>
                        {attr.isRequired && (
                          <span className="text-xs font-medium text-primary">
                            اجباری
                          </span>
                        )}
                      </div>
                      {isSelect ? (
                        <CustomSelect
                          options={options.map((opt: string) => ({ value: opt, label: opt }))}
                          value={attributeValues[attr.id] || ''}
                          onChange={(val) => handleAttributeChange(attr.id, val as string)}
                          label="مقدار ویژگی"
                          required={attr.isRequired}
                          error={attr.isRequired && !attributeValues[attr.id] ? 'این فیلد الزامی است' : undefined}
                        />
                      ) : attr.type === 'boolean' ? (
                        <CustomSelect
                          options={[
                            { value: 'true', label: 'بله' },
                            { value: 'false', label: 'خیر' },
                          ]}
                          value={attributeValues[attr.id] || ''}
                          onChange={(val) => handleAttributeChange(attr.id, val as string)}
                          label="مقدار ویژگی"
                          required={attr.isRequired}
                          error={attr.isRequired && !attributeValues[attr.id] ? 'این فیلد الزامی است' : undefined}
                        />
                      ) : (
                        <Input
                          name={`attr_${attr.id}`}
                          label="مقدار ویژگی"
                          placeholder={`مقدار ویژگی ${attr.name}`}
                          type={attr.type === 'number' ? 'number' : 'text'}
                          value={attributeValues[attr.id] || ''}
                          onChange={(e) =>
                            handleAttributeChange(attr.id, e.target.value)
                          }
                          required={attr.isRequired}
                          error={attr.isRequired && !attributeValues[attr.id] ? 'این فیلد الزامی است' : undefined}
                          className="w-full"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/products')}
              disabled={updateProductMutation.isPending}
            >
              لغو
            </Button>
            <Button
              type="submit"
              disabled={updateProductMutation.isPending}
            >
              بروزرسانی محصول
            </Button>
          </div>
        </form>
      </Card>

      {imagePreview && (
        <Modal
          open={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          title="پیش نمایش تصویر"
          size="md"
        >
          <div className="flex items-center justify-center">
            <img
              src={imagePreview}
              alt="پیش نمایش"
              className="max-w-full max-h-[60vh] rounded-xl shadow-2xl object-contain"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setImageModalOpen(false)}>
              بستن
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
