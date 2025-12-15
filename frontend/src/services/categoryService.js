import api from './api';

export const categoryService = {
  list: (filters = {}) => {
    return api.get('/api/categories', { params: filters });
  },

  getById: (id) => {
    return api.get(`/api/categories/${id}`);
  },

  create: (data) => {
    return api.post('/api/categories', data);
  },

  update: (id, data) => {
    return api.put(`/api/categories/${id}`, data);
  },

  delete: (id) => {
    return api.delete(`/api/categories/${id}`);
  },
};

