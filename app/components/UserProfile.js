'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  UserIcon, 
  BriefcaseIcon, 
  CalendarIcon, 
  AcademicCapIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export default function UserProfile() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [experiences, setExperiences] = useState([]);
  const [colleges, setColleges] = useState({});
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);
  
  const fetchColleges = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/colleges`);
      if (response.status === 200) {
        const collegesMap = {};
        response.data.forEach(college => {
          collegesMap[college.id] = college.name;
        });
        setColleges(collegesMap);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  }, []);

  const fetchUserExperiences = useCallback(async () => {
    if (!user?.id || hasFetchedRef.current) return;
    
    try {
      setIsLoadingExperiences(true);
      const token = localStorage.getItem('token');
      
      console.log('Fetching user experiences for user:', user.id);
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/experiences`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        params: { userId: user.id }
      });
      
      console.log('API Response:', response.status, response.data);
      
      if (!isMountedRef.current) return;
      
      if (response.status === 200) {
        const experiencesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.data || []);
        
        setExperiences(experiencesData);
        hasFetchedRef.current = true;
      } else {
        const errorMsg = response.data?.error || 'Failed to load interview experiences';
        console.error('API Error:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
      if (isMountedRef.current) {
        setError(error.response?.data?.error || error.message || 'Failed to load interview experiences');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingExperiences(false);
      }
    }
  }, [user?.id]);
  
  // Handle authentication and initial data loading
  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  useEffect(() => {
    isMountedRef.current = true;
    
    const init = async () => {
      if (authLoading) return;
      
      try {
        if (!user) {
          const isAuthenticated = await checkAuth();
          if (!isAuthenticated) {
            router.push('/auth/login?redirect=/profile');
            return;
          }
        }
        
        if (user?.id) {
          await fetchUserExperiences();
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        if (isMountedRef.current) {
          setError('Authentication error. Please login again.');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [user, authLoading, checkAuth, router, fetchUserExperiences]);

  const handleViewExperience = (experienceId) => {
    router.push(`/experiences/${experienceId}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Not logged in</h3>
          <p className="mt-1 text-sm text-gray-500">Please log in to view your profile.</p>
          <button
            onClick={() => router.push('/auth/login?redirect=/profile')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Your personal details and account information.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Interview Experiences */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Your Interview Experiences</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                All the interview experiences you've shared with the community.
              </p>
            </div>
            <a
              href="/share-experience"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <BriefcaseIcon className="-ml-1 mr-2 h-5 w-5" />
              Share New Experience
            </a>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            {isLoadingExperiences ? (
              <div className="text-center py-12">
                <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                <p className="mt-2 text-sm text-gray-500">Loading your experiences...</p>
              </div>
            ) : experiences.length === 0 ? (
              <div className="text-center py-12">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No experiences shared yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by sharing your first interview experience.
                </p>
                <div className="mt-6">
                  <a
                    href="/share-experience"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <BriefcaseIcon className="-ml-1 mr-2 h-5 w-5" />
                    Share Experience
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {experiences.map((experience) => (
                    <li key={experience._id} className="hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {colleges[experience.collegeId] || 'College'}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 sm:ml-4">
                            {experience.isVerified ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircleIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-green-400" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <ClockIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-yellow-400" />
                                Under Review
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {formatDate(experience.createdAt)}
                          </p>
                          {experience.verificationStatus && (
                            <div key={`verification-${experience._id}`} className="mt-2">
                              <span className="text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                Verified by {experience.verifiedBy?.name || 'Admin'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
