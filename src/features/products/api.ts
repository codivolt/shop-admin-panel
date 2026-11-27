import { api } from '../../services/api';

export function getProducts(params?: any) {
  return api.get('/products', { params });
}

export function getProduct(id: string) {
  return api.get(`/products/${id}`);
}

export function createProduct(data: any) {
  return api.post('/products', data);
}

export function updateProduct(id: string, data: any) {
  return api.put(`/products/${id}`, data);
}

export function deleteProduct(id: string) {
  return api.delete(`/products/${id}`);
}

export function uploadProductImage(form: FormData, config?: any) {
  return api.post('/products/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });
}

export function getProductImages(productId: string) {
  return api.get(`/products/${productId}/images`);
}

export function uploadProductImageToGallery(productId: string, form: FormData, config?: any) {
  return api.post(`/products/${productId}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });
}

export function updateProductImage(
  productId: string,
  imageId: string,
  data: any,
) {
  return api.put(`/products/${productId}/images/${imageId}`, data);
}

export function deleteProductImage(productId: string, imageId: string) {
  return api.delete(`/products/${productId}/images/${imageId}`);
}

export function getProductAttributeValues(productId: string) {
  return api.get(`/products/${productId}/attribute-values`);
}

export const getProductAttributeValuesResponse = getProductAttributeValues;

export function createProductAttributeValue(productId: string, data: any) {
  return api.post(`/products/${productId}/attribute-values`, data);
}

export function updateProductAttributeValue(
  productId: string,
  id: string,
  data: any,
) {
  return api.put(`/products/${productId}/attribute-values/${id}`, data);
}