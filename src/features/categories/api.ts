import { api } from '../../services/api';

export function getCategories(params?: any) {
  return api.get('/categories', { params });
}

export function getCategory(id: string) {
  return api.get(`/categories/${id}`);
}

export function createCategory(data: any) {
  return api.post('/categories', data);
}

export function updateCategory(id: string, data: any) {
  return api.put(`/categories/${id}`, data);
}

export function deleteCategory(id: string) {
  return api.delete(`/categories/${id}`);
}

export function uploadCategoryImage(form: FormData, config?: any) {
  return api.post('/categories/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });
}

export function getCategoryAttributes(categoryId: string) {
  return api.get(`/categories/${categoryId}/attributes`);
}

export function createCategoryAttribute(categoryId: string, data: any) {
  return api.post(`/categories/${categoryId}/attributes`, data);
}

export function updateCategoryAttribute(
  categoryId: string,
  id: string,
  data: any,
) {
  return api.put(`/categories/${categoryId}/attributes/${id}`, data);
}

export function deleteCategoryAttribute(categoryId: string, id: string) {
  return api.delete(`/categories/${categoryId}/attributes/${id}`);
}