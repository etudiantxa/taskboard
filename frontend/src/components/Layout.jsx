
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api/auth';
import { useQuery } from '@tanstack/react-query';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, currentOrganization, setCurrentOrganization, logout } = useAuthStore();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch user data to get organizations
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authAPI.getCurrentUser();
      return response.data.user;
    },
  });

  // Set current organization from user data
  useEffect(() => {
    if (userData?.currentOrganizationId && !currentOrganization) {
      setCurrentOrganization(userData.currentOrganizationId);
    }
  }, [userData, currentOrganization, setCurrentOrganization]);

  const handleSwitchOrg = async (orgId) => {
    try {
      await authAPI.switchOrganization(orgId);
      setCurrentOrganization(orgId);
      setShowOrgDropdown(false);
      window.location.reload(); // Refresh to update all data
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">TaskBoard</span>
              </Link>
              
              <div className="hidden md:flex space-x-4">
                <Link 
                  to="/" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/projects" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  Projects
                </Link>
                <Link 
                  to="/board" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  Task Board
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Organization Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {currentOrganization?.name || 'Select Organization'}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showOrgDropdown && userData?.organizations && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      {userData.organizations.map((org) => (
                        <button
                          key={org.organizationId._id}
                          onClick={() => handleSwitchOrg(org.organizationId._id)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                            currentOrganization?.id === org.organizationId._id
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{org.organizationId.name}</span>
                            {currentOrganization?.id === org.organizationId._id && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{org.role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;