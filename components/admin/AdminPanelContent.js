'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

// Colleges Component

// API base URL
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

// Helper function to handle API errors
const handleApiError = (error, setError) => {
  console.error('API Error:', error);
  const message = error.response?.data?.message || error.message || 'An error occurred';
  setError(message);
  return message;
};

const AdminPanelContent = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingExperiences, setPendingExperiences] = useState([]);
  const [verifiedExperiences, setVerifiedExperiences] = useState([]);
  const [allExperiences, setAllExperiences] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [stats, setStats] = useState({
    totalExperiences: 0,
    totalVerifiedExperiences: 0,
    pendingExperiences: 0
  });

  const router = useRouter();

  // Fetch data when component mounts and when tab changes
  useEffect(() => {
    // Initial load - fetch stats and data for the default tab (pending)
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchStats(),
          fetchExperiences('pending')
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        handleApiError(error, setError);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle tab changes
  useEffect(() => {
    if (selectedTab) {
      fetchExperiences(selectedTab);
    }
  }, [selectedTab]);

  // Fetch experiences for a specific tab
  const fetchExperiences = async (tab) => {
    try {
      setLoading(true);
      setError('');
      
      let endpoint = '';
      switch(tab) {
        case 'pending':
          endpoint = '/admin/experiences/pending';
          break;
        case 'verified':
          endpoint = '/admin/experiences/verified';
          break;
        case 'all':
          endpoint = '/admin/experiences/all';
          break;
        default:
          endpoint = '/admin/experiences/all';
      }
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      const data = Array.isArray(response.data) ? response.data : [];
      
      // Transform the data to include default values for nested objects
      const transformedData = data.map(exp => ({
        ...exp,
        status: exp.isVerified ? 'verified' : 'pending',
        college: exp.college || { name: 'N/A', id: exp.collegeId },
        user: {
          name: exp.user?.name || 'Anonymous',
          email: exp.user?.email || 'No email',
          ...exp.user
        },
        profile: {
          stream: exp.profile?.stream || '',
          category: exp.profile?.category || '',
          workExperience: exp.profile?.workExperience || '',
          catPercentile: exp.profile?.catPercentile || '',
          ...exp.profile
        }
      }));

      // Update the appropriate state based on the tab
      if (tab === 'pending') {
        setPendingExperiences(transformedData);
      } else if (tab === 'verified') {
        setVerifiedExperiences(transformedData);
      } else {
        setAllExperiences(transformedData);
      }
      
    } catch (error) {
      console.error(`Error fetching ${tab} experiences:`, error);
      handleApiError(error, setError);
      
      // Reset the appropriate state on error
      if (tab === 'pending') {
        setPendingExperiences([]);
      } else if (tab === 'verified') {
        setVerifiedExperiences([]);
      } else {
        setAllExperiences([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const [allRes, pendingRes, verifiedRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/experiences/all`),
        axios.get(`${API_BASE_URL}/admin/experiences/pending`),
        axios.get(`${API_BASE_URL}/admin/experiences/verified`)
      ]);
      
      const allData = Array.isArray(allRes.data) ? allRes.data : [];
      const pendingData = Array.isArray(pendingRes.data) ? pendingRes.data : [];
      const verifiedData = Array.isArray(verifiedRes.data) ? verifiedRes.data : [];
      
      setStats({
        totalExperiences: allData.length,
        pendingExperiences: pendingData.length,
        totalVerifiedExperiences: verifiedData.length
      });
      
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats({
        totalExperiences: 0,
        pendingExperiences: 0,
        totalVerifiedExperiences: 0
      });
    }
  };

  const handleVerify = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/experiences/${id}/verify`);
      // Refresh both the current view and stats
      await Promise.all([
        fetchExperiences(selectedTab),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error verifying experience:', error);
      setError('Failed to verify experience');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/experiences/${id}/reject`);
      fetchData();
    } catch (error) {
      console.error('Error rejecting experience:', error);
      setError('Failed to reject experience');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/experiences/${id}`);
        // Refresh both the current view and stats
        await Promise.all([
          fetchExperiences(selectedTab),
          fetchStats()
        ]);
      } catch (error) {
        console.error('Error deleting experience:', error);
        setError('Failed to delete experience');
      }
    }
  };

  const viewExperience = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/experiences/${id}`);
      const exp = response.data;
      
      // Transform the experience data for display
      const experienceWithDefaults = {
        ...exp,
        profile: {
          stream: '',
          category: '',
          workExperience: '',
          catPercentile: '',
          ...exp.profile
        },
        piQuestions: Array.isArray(exp.piQuestions) ? exp.piQuestions : [],
        college: exp.college || { name: 'N/A' },
        user: exp.user || { name: 'Anonymous', email: 'No email' }
      };
      
      setSelectedExperience(experienceWithDefaults);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching experience:', error);
      setError('Failed to fetch experience details');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExperience(null);
  };

  const tabs = [
    { id: 'pending', label: 'Pending Experiences' },
    { id: 'verified', label: 'Verified Experiences' },
    { id: 'all', label: 'All Experiences' }
  ];

  const renderExperienceTable = (experiences, tabId) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              College
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Submitted by
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {experiences && experiences.length > 0 ? (
            experiences.map((exp) => (
              <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {exp.college?.name || 'N/A'}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {exp.year ? `Year: ${exp.year}` : ''}
                    {exp.profile?.stream ? ` • ${exp.profile.stream}` : ''}
                    {exp.profile?.catPercentile ? ` • CAT: ${exp.profile.catPercentile}%` : ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  <div className="font-medium">{exp.user?.name || 'Anonymous'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{exp.user?.email || 'No email'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(exp.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => viewExperience(exp.id)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View
                  </button>
                  {tabId === 'pending' && (
                    <button
                      onClick={() => handleVerify(exp.id)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 ml-2"
                    >
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No experiences found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/admin/colleges" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800 text-sm font-medium"
          >
            Manage Colleges
          </Link>
          <button
            onClick={() => document.documentElement.classList.toggle('dark')}
            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
          >
            Toggle Dark Mode
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Statistics</h2>
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalExperiences}</div>
            <p className="text-gray-600 dark:text-gray-300">Total Experiences</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalVerifiedExperiences}</div>
            <p className="text-gray-600 dark:text-gray-300">Verified Experiences</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingExperiences}</div>
            <p className="text-gray-600 dark:text-gray-300">Pending Review</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {tabs.find(tab => tab.id === selectedTab)?.label || 'Content'}
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedTab === 'pending' ? (
            renderExperienceTable(pendingExperiences, 'pending')
          ) : selectedTab === 'verified' ? (
            renderExperienceTable(verifiedExperiences, 'verified')
          ) : (
            renderExperienceTable(allExperiences, 'all')
          )}
        </div>
      </div>

      {/* Experience Modal */}
      {isModalOpen && selectedExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Experience Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">College</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedExperience.college?.name || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedExperience.year || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stream</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedExperience.profile?.stream || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Result</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedExperience.category || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Work Experience</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedExperience.profile?.workExperience ? `${selectedExperience.profile.workExperience} years` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CAT Percentile</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedExperience.profile?.catPercentile ? `${selectedExperience.profile.catPercentile}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted By</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedExperience.user?.name || 'Anonymous'}
                        {selectedExperience.user?.email && (
                          <span className="block text-gray-500 dark:text-gray-400">{selectedExperience.user.email}</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Submitted</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {new Date(selectedExperience.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Anonymous</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedExperience.isAnonymous ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Added</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {new Date(selectedExperience.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interview Experience</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">WAT Summary</p>
                      <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                          {selectedExperience.watSummary || 'No WAT summary provided.'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Personal Interview</p>
                      {selectedExperience.piQuestions?.length > 0 ? (
                        <div className="space-y-4">
                          {selectedExperience.piQuestions.map((q, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {q.question || `Question ${index + 1}`}
                              </p>
                              <p className="mt-1 text-gray-800 dark:text-gray-200">
                                {q.answer || 'No answer provided.'}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No PI questions available.</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Final Remarks</p>
                      <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                          {selectedExperience.finalRemarks || 'No final remarks provided.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelContent;
