// src/api/organizations.js
import apiClient from './client';

export const organizationsAPI = {
  getAll: () => apiClient.get('/organizations'),
  getById: (id) => apiClient.get(`/organizations/${id}`),
  create: (data) => apiClient.post('/organizations', data),
  update: (id, data) => apiClient.put(`/organizations/${id}`, data),
  inviteMember: (id, data) => apiClient.post(`/organizations/${id}/invite`, data),
};