import api from './api';

export const productService = {
  list: (filters = {}) => {
    return api.get('/api/products', { params: filters });
  },

  getById: (id) => {
    return api.get(`/api/products/${id}`);
  },

  create: (data) => {
    return api.post('/api/products', data);
  },

  update: (id, data) => {
    return api.put(`/api/products/${id}`, data);
  },

  delete: (id) => {
    return api.delete(`/api/products/${id}`);
  },

  bulkDelete: (ids) => {
    return api.post('/api/products/bulk-delete', { ids });
  },

  export: (format = 'json', filters = {}) => {
    return api.get('/api/products/export', {
      params: { format, ...filters },
      responseType: 'blob',
    });
  },

  import: (data) => {
    return api.post('/api/products/import', data);
  },
};

