// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      currentOrganization: null,

      setAuth: (token, user) => set({ token, user }),
      
      setCurrentOrganization: (orgId) => set((state) => {
  if (!state.user) return state;

  const org = state.user.organizations.find(o => {
    // Peut être un objet { _id: ... } ou une string directe
    if (typeof o.organizationId === 'string') {
      return o.organizationId === orgId;
    }
    return o.organizationId._id === orgId;
  });

  return {
    currentOrganization: org
      ? {
          id: typeof org.organizationId === 'string'
            ? org.organizationId
            : org.organizationId._id,
          name: org.organizationId?.name || 'Organization',
          slug: org.organizationId?.slug || '',
          role: org.role,
        }
      : null,
  };
}),

      
      updateUser: (user) => set({ user }),
      
      logout: () => set({ token: null, user: null, currentOrganization: null }),
    }),
    {
      name: 'taskboard-auth',
    }
  )
);