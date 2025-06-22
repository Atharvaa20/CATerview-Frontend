'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Ensure dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function ExperiencePage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHelpful, setIsHelpful] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  
  const handleBack = (e) => {
    e?.preventDefault();
    const collegeId = searchParams.get('collegeId');
    if (collegeId) {
      router.push(`/colleges?collegeId=${collegeId}`);
    } else if (experience?.collegeId) {
      router.push(`/colleges?collegeId=${experience.collegeId}`);
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/colleges');
    }
  }

  useEffect(() => {
    if (!id) {
      router.push('/colleges');
      return;
    }

    console.log('Fetching experience with ID:', id);
    
    // Mark as loading and fetch the experience
    setLoading(true);
    fetchExperience();
    
    // Cleanup function
    return () => {
      // Cancel any pending requests or timeouts
      setLoading(false);
    };
    // We need to include router in the dependency array to avoid stale closures
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Handle browser back/forward navigation
  useEffect(() => {
    const handleRouteChange = () => {
      // Force a re-render when route changes (back/forward)
      setExperience(null);
      setUpvotes(0);
      setLoading(true);
      fetchExperience();
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [id]);

  const fetchExperience = async () => {
    try {
      console.log('Fetching experience with ID:', id);
      
      // Use the new API route
      const response = await fetch(`/api/experience/${id}`, { 
        cache: 'no-store',
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch experience: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Experience data:', data);
      setExperience(data);
      setUpvotes(data.upvotes || 0);
    } catch (error) {
      console.error('Error fetching experience:', error);
      // Fallback to direct API call if the route fails
      try {
        console.log('Trying direct API call...');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const directResponse = await fetch(
          `${apiUrl}/api/experiences/${id}`,
          { 
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!directResponse.ok) {
          throw new Error(`Direct API call failed: ${directResponse.statusText}`);
        }

        const data = await directResponse.json();
        setExperience(data);
        setUpvotes(data.upvotes || 0);
      } catch (fallbackError) {
        console.error('Fallback API call failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/experiences/${id}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to update helpful status')
      }

      const data = await response.json()
      setIsHelpful(data.isHelpful)
      setUpvotes(data.upvotes)
    } catch (error) {
      console.error('Error updating helpful status:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Experience not found
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={handleBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to {experience?.college?.name || 'college'}'s experiences
      </button>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {experience.collegeName}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date(experience.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              {experience.isVerified ? (
                <span className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded-full">
                  Verified
                </span>
              ) : (
                <span className="px-2 py-1 text-xs text-yellow-600 bg-yellow-100 rounded-full">
                  Pending Review
                </span>
              )}
              <span className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded-full">
                {upvotes} Helpful
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Profile Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Stream:</strong> {experience.profile.stream}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Result:</strong> {experience.profile.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Work Experience:</strong>{' '}
                    {experience.profile.workExperience} years
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>CAT Percentile:</strong>{' '}
                    {experience.profile.catPercentile}%ile
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                WAT Summary
              </h2>
              <p className="text-gray-600">{experience.watSummary}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Personal Interview Questions
              </h2>
              <div className="space-y-4">
                {experience.piQuestions.map((q, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Question {index + 1}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">{q.question}</p>
                      <p className="text-gray-600 italic">{q.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Final Remarks
              </h2>
              <p className="text-gray-600">{experience.finalRemarks}</p>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleHelpful}
                className="flex items-center text-sm text-gray-600 hover:text-gray-500"
              >
                {isHelpful ? (
                  <>
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                    Remove as Helpful
                  </>
                ) : (
                  <>
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    Mark as Helpful
                  </>
                )}
              </button>
              <div className="flex space-x-4">
                <button
                  className="flex items-center text-sm text-gray-600 hover:text-gray-500"
                  onClick={() => {
                    // TODO: Implement share functionality
                  }}
                >
                  Share
                </button>
                <button
                  className="flex items-center text-sm text-gray-600 hover:text-gray-500"
                  onClick={() => {
                    // TODO: Implement report functionality
                  }}
                >
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
