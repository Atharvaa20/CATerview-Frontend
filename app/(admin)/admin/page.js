'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

// Dynamically import the admin components with SSR disabled
const AdminPanelContent = dynamic(
  () => import('../../../components/admin/AdminPanelContent'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const Colleges = dynamic(
  () => import('../../../components/admin/Colleges'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3">Loading...</span>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
      <button
        onClick={() => window.location.href = '/'}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Return to Home
      </button>
    </div>
  </div>
);

export default function AdminPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isClient, setIsClient] = useState(false);

  // Set initial tab from URL or default to 'dashboard'
  useEffect(() => {
    setIsClient(true);
    const tab = searchParams.get('tab') || 'dashboard';
    if (['dashboard', 'colleges'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', tab);
    window.history.pushState({}, '', newUrl);
  };

  // Show loading state during initial render and auth check
  if (!isClient || authLoading) {
    return <LoadingSpinner />;
  }

  // Redirect if not admin
  if (!user || !isAdmin) {
    return <Unauthorized />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">Manage your application</p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleTabChange('colleges')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'colleges'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Manage Colleges
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && <AdminPanelContent />}
            {activeTab === 'colleges' && <Colleges />}
          </div>
        </div>
      </div>
    </div>
  );
}
