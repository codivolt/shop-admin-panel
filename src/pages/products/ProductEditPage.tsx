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
import { getAbsoluteImageUrl } from '../../lib/image';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.imageUrl;
    },
    onSuccess: (url) => {
      const absoluteUrl = getAbsoluteImageUrl(url);
      setUploadedImageUrl(url);
      setImagePreview(absoluteUrl);
      toast.success('تصویر آپلود شد');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در آپلود تصویر');
      setImageFile(null);
      setImagePreview(null);
    },
  });

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

  const uploadGalleryImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/products/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('تصویر گالری اضافه شد');
      refetchImages();
      setGalleryUploading(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در آپلود تصویر');
      setGalleryUploading(false);
    },
  });

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

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setGalleryUploading(true);
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        uploadGalleryImageMutation.mutate(file);
      }
    });
    e.target.value = '';
  };

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (incoming.length === 0) return;

    const validFiles = incoming.filter(
      (file) => file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE,
    );
    if (validFiles.length !== incoming.length) {
      toast.error('هر تصویر باید حداکثر 2 مگابایت باشد و از نوع عکس باشد');
    }
    if (validFiles.length === 0) return;

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImagePreview(newPreviews[0] ?? null);
    setImageFile(validFiles[0]);

    // First image becomes the main product image, the rest go to the gallery
    uploadImageMutation.mutate(validFiles[0]);
    if (validFiles.length > 1) {
      setGalleryUploading(true);
      validFiles.slice(1).forEach((file) => uploadGalleryImageMutation.mutate(file));
    }
    e.target.value = '';
  };

  const removeImage = () => {
    setImageFile(null);
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
        setImageFile(null);
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
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreviews.length > 0 ? (
                <div className="w-full">
                  <div className="flex flex-wrap justify-center gap-3">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={src}
                          alt={`پیش نمایش ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-xl shadow-md"
                        />
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            removeImageAt(idx);
                          }}
                          className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700"
                          aria-label="حذف تصویر"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        document.getElementById('product-image-input')?.click();
                      }}
                      className="flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-colors"
                    >
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[11px] font-medium">افزودن</span>
                    </button>
                  </div>
                  <div className="mt-3 text-sm font-medium text-primary">
                    {imagePreviews.length} تصویر جدید انتخاب شده
                  </div>
                </div>
              ) : imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="پیش نمایش"
                    className="w-32 h-32 object-cover rounded-xl shadow-md"
                  />
                  <div className="mt-3 text-sm font-medium text-primary">
                    تصویر فعلی محصول
                  </div>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-sm font-medium text-muted-soft">
                    انتخاب تصویر محصول (چندگانه)
                  </div>
                  <p className="text-xs text-muted mt-1">
                    فرمت‌های پشتیبانی شده: JPG, PNG, WEBP — حداکثر 2 مگابایت برای هر تصویر
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-fg">گالری تصاویر</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGalleryModalOpen(true)}
                disabled={galleryUploading}
              >
                {galleryUploading ? 'در حال آپلود...' : 'افزودن تصاویر'}
              </Button>
            </div>
            {productImages.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <p>هیچ تصویری در گالری وجود ندارد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {productImages.map((img) => (
                  <div
                    key={img.id}
                    className={`relative group rounded-xl border overflow-hidden ${
                      img.isPrimary ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    }`}
                  >
                    <img
                      src={getAbsoluteImageUrl(img.imageUrl) ?? ''}
                      alt={`Gallery ${img.id}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!img.isPrimary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => handleSetPrimary(img.id)}
                        >
                          اصلی
                        </Button>
                      )} else {
                        <span className="text-xs text-green-300 bg-green-600/20 px-2 py-1 rounded">تصویر اصلی</span>
                      }
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-red-500/20"
                        onClick={() => handleDeleteGalleryImage(img.id)}
                      >
                        حذف
                      </Button>
                    </div>
                    {img.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <span className="text-xs font-medium text-green-300 bg-green-900/50 px-1.5 py-0.5 rounded">
                          اصلی
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Gallery Modal */}
            <Modal
              open={galleryModalOpen}
              onClose={() => setGalleryModalOpen(false)}
              title="افزودن تصاویر به گالری"
              size="md"
            >
              <div className="space-y-4">
                <div
                  className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all ${
                    galleryUploading ? 'border-primary bg-primary/5' : 'border-border bg-surface-2 hover:border-primary hover:bg-surface-2'
                  } cursor-pointer`}
                  onClick={() => document.getElementById('gallery-image-input')?.click()}
                >
                  <input
                    id="gallery-image-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageUpload}
                    className="hidden"
                    disabled={galleryUploading}
                  />
                  {galleryUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      <p className="text-sm font-medium text-primary">در حال آپلود تصاویر...</p>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-sm font-medium text-muted-soft">
                        انتخاب تصاویر (چندگانه)
                      </div>
                      <p className="text-xs text-muted mt-1">
                        فرمت‌های پشتیبانی شده: JPG, PNG, WEBP
                      </p>
                    </>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setGalleryModalOpen(false)}>
                    بستن
                  </Button>
                </div>
              </div>
            </Modal>
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
