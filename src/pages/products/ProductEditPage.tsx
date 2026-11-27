import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import Input from '../../components/input/Input';
import AmountInput from '../../components/input/AmountInput';
import Button from '../../components/button/Button';
import Card from '../../components/layout/Card';
import ProductImagesField from '../../components/product/ProductImagesField';
import CustomSelect from '../../components/form/CustomSelect';
import Modal from '../../components/layout/Modal';
import toast from 'react-hot-toast';

import Breadcrumb from '../../components/layout/Breadcrumb';
import { getAbsoluteImageUrl } from '../../lib/image';
import { slugify } from '../../lib/slugify';
import { productSchema, type ProductFormData } from '../../lib/product-schema';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

interface ProductAttributeValueResponse {
  id: string;
  productId: string;
  attributeId: string;
  value: string;
  attribute?: { id: string; name: string; type: string };
  createdAt: string;
  updatedAt: string;
}

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

interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  // Fetch product images
  const { data: imagesData, refetch: refetchImages } = useQuery<ProductImage[]>({
    queryKey: ['productImages', id],
    queryFn: async () => {
      const res = await api.get<ProductImage[]>(`/products/${id}/images`);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (imagesData) {
      setProductImages(imagesData);
    }
  }, [imagesData]);

  const updateGalleryImageMutation = useMutation({
    mutationFn: async ({ imageId, data }: { imageId: string; data: { isPrimary?: boolean; sortOrder?: number } }) => {
      const res = await api.put(`/products/${id}/images/${imageId}`, data);
      return res.data;
    },
    onSuccess: () => {
      refetchImages();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی تصویر');
    },
  });

  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await api.delete(`/products/${id}/images/${imageId}`);
    },
    onSuccess: () => {
      toast.success('تصویر حذف شد');
      refetchImages();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف تصویر');
    },
  });

  const handleSetPrimary = (imageId: string) => {
    updateGalleryImageMutation.mutate({ imageId, data: { isPrimary: true } });
  };

  const handleDeleteGalleryImage = (imageId: string) => {
    if (window.confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
      deleteGalleryImageMutation.mutate(imageId);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    control,
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

  const watchedName = watch('name');
  const lastGeneratedSlug = useRef<string>('');
  const prevNameRef = useRef<string>('');

  const { data: product, isLoading: productLoading, refetch: refetchProduct } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get<Product>(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (product?.slug) {
      lastGeneratedSlug.current = product.slug;
    }
  }, [product?.slug]);

  useEffect(() => {
    if (!watchedName) {
      prevNameRef.current = '';
      return;
    }
    if (watchedName === prevNameRef.current) return;
    prevNameRef.current = watchedName;
    const generated = slugify(watchedName);
    const currentSlug = getValues('slug');
    if (!currentSlug || currentSlug === lastGeneratedSlug.current) {
      setValue('slug', generated);
      lastGeneratedSlug.current = generated;
    }
  }, [watchedName, getValues, setValue]);

  const mainImage =
    product?.imageUrl &&
    !productImages.some((img) => img.imageUrl === product.imageUrl)
      ? { id: 'main', imageUrl: product.imageUrl, isPrimary: true }
      : null;
  const displayImages = mainImage ? [mainImage, ...productImages] : productImages;

  const removeMainImage = async () => {
    if (!id) return;
    if (!window.confirm('آیا از حذف تصویر اصلی اطمینان دارید؟')) return;
    try {
      await api.put(`/products/${id}`, { imageUrl: null });
      setUploadedImageUrl(null);
      setImagePreview(null);
      await refetchProduct();
      refetchImages();
      toast.success('تصویر اصلی حذف شد');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در حذف تصویر اصلی');
    }
  };

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
      setImagePreview(getAbsoluteImageUrl(product.imageUrl) || null);
      setUploadedImageUrl(null);
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
    mutationFn: async (data: ProductFormData & { imageUrl?: string }) => {
      const payload = { ...data };
      if (uploadedImageUrl) {
        payload.imageUrl = uploadedImageUrl;
      }
      const res = await api.put(`/products/${id}`, payload);
      return res.data;
    },
    onSuccess: async (updatedProduct) => {
      toast.success('محصول با موفقیت بروزرسانی شد');
      try {
        // First get existing attribute values to know which to create vs update
        const existingRes = await api.get<ProductAttributeValueResponse[]>(
          `/products/${updatedProduct.id}/attribute-values`
        );
        const existingValues = existingRes.data || [];
        const existingMap = new Map(existingValues.map(v => [v.attributeId, v.id]));

        const savePromises = Object.entries(attributeValues).map(
          async ([attributeId, value]) => {
            if (!value.trim()) return;
            const existingId = existingMap.get(attributeId);
            if (existingId) {
              // Update existing
              return api.put(`/products/${updatedProduct.id}/attribute-values/${existingId}`, {
                attributeId,
                value,
              });
            } else {
              // Create new
              return api.post(`/products/${updatedProduct.id}/attribute-values`, {
                attributeId,
                value,
              });
            }
          }
        );
        await Promise.all(savePromises);
      } catch (err) {
        console.error('Failed to save attribute values:', err);
        toast.error('بروزرسانی ویژگی‌ها با خطا مواجه شد');
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      navigate('/products');
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (incoming.length === 0) return;

    const validFiles = incoming.filter(
      (file) => file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE,
    );
    if (validFiles.length !== incoming.length) {
      toast.error('هر تصویر باید حداکثر 2 مگابایت باشد و از نوع عکس باشد');
    }
    if (validFiles.length === 0 || !id) return;

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImagePreview(newPreviews[0] ?? null);
    setGalleryUploading(true);

    try {
      let firstImageId: string | null = null;
      for (let i = 0; i < validFiles.length; i++) {
        const form = new FormData();
        form.append('file', validFiles[i]);
        const res = await api.post(`/products/${id}/images`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (i === 0) firstImageId = res.data.id;
      }
      // Make the first newly added image the primary (main) image
      if (firstImageId) {
        await api.put(`/products/${id}/images/${firstImageId}`, {
          isPrimary: true,
        });
      }
      await refetchImages();
      await refetchProduct();
      setImagePreviews([]);
      toast.success('تصاویر اضافه شد');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در آپلود تصاویر');
    } finally {
      setGalleryUploading(false);
    }
    e.target.value = '';
  };

  const removeImage = () => {
    setImagePreview(null);
    setImagePreviews([]);
    setUploadedImageUrl(null);
    setImageModalOpen(false);
  };

  const removeImageAt = (index: number) => {
    setImagePreviews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setImagePreview(next[0] ?? null);
      if (next.length === 0) {
        setUploadedImageUrl(null);
      }
      return next;
    });
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
          <ProductImagesField
            imagePreviews={imagePreviews}
            displayImages={displayImages}
            galleryUploading={galleryUploading}
            getAbsoluteImageUrl={getAbsoluteImageUrl}
            onFileChange={handleImageChange}
            onRemoveNew={removeImage}
            onRemoveNewAt={removeImageAt}
            onRemoveMain={removeMainImage}
            onDeleteGallery={handleDeleteGalleryImage}
            onSetPrimary={handleSetPrimary}
          />

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
              <Controller
                control={control}
                name="price"
                render={({ field, fieldState }) => (
                  <AmountInput
                    name="price"
                    label="قیمت (تومان) *"
                    required
                    value={field.value as number}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
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
              دسته‌بندی *
            </label>
            <CustomSelect
              options={categories?.map((cat) => ({ value: cat.id, label: cat.name })) ?? []}
              value={selectedCategoryId}
              onChange={(val) => {
                setValue('categoryId', val as string);
                setSelectedCategoryId(val as string);
              }}
              label="دسته‌بندی"
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
                <h3 className="text-lg font-bold text-fg">ویژگی‌های دسته‌بندی</h3>
                <p className="text-xs text-muted">
                  ویژگی‌های تعریف شده برای این دسته‌بندی
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
