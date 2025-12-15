import api from './api';

export const orderService = {
  list: (filters = {}) => {
    return api.get('/api/orders', { params: filters });
  },

  getById: (id) => {
    return api.get(`/api/orders/${id}`);
  },

  create: (data) => {
    return api.post('/api/orders', data);
  },

  update: (id, data) => {
    return api.put(`/api/orders/${id}`, data);
  },

  delete: (id) => {
    return api.delete(`/api/orders/${id}`);
  },
};

