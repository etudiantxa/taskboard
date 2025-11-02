import apiClient from './client';

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  switchOrganization: (organizationId) => 
    apiClient.post('/auth/switch-organization', { organizationId }),
};