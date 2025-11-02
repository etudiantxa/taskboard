// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth, setCurrentOrganization } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await authAPI.login(formData);
    const { token, user } = response.data;

    console.log("🧩 User after login:", user);
    console.log("🏢 User organizations:", user.organizations);

    // On sauvegarde l'utilisateur et le token
    setAuth(token, user);

    // Si tu veux définir l'organisation courante automatiquement :
    if (user.organizations && user.organizations.length > 0) {
      const firstOrg = user.organizations[0];
const firstOrgId = typeof firstOrg.organizationId === 'string'
  ? firstOrg.organizationId
  : firstOrg.organizationId._id;

console.log("✅ Setting current organization:", firstOrgId);
setCurrentOrganization(firstOrgId);

      console.log("✅ Setting current organization:", firstOrgId);
      setCurrentOrganization(firstOrgId);
    } else if (user.currentOrganizationId) {
      console.log("✅ Setting current organization from user.currentOrganizationId:", user.currentOrganizationId);
      setCurrentOrganization(user.currentOrganizationId);
    } else {
      console.warn("⚠️ No organization found for user.");
    }

    navigate('/');
  } catch (err) {
    console.error("❌ Login error:", err.response?.data || err.message);
    setError(err.response?.data?.error || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">TaskBoard</h1>
          <p className="text-gray-600">Multi-tenant Project Management</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-medium transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;