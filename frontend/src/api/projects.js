// src/api/projects.js
import apiClient from './client';

export const projectsAPI = {
  getAll: (params) => apiClient.get('/projects', { params }),
  getById: (id) => apiClient.get(`/projects/${id}`),
  create: (data) => apiClient.post('/projects', data),
  update: (id, data) => apiClient.put(`/projects/${id}`, data),
  delete: (id) => apiClient.delete(`/projects/${id}`),
};