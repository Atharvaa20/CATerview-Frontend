'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Search from './components/Search';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

export default function Home() {
  const [allColleges, setAllColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Function to fetch colleges
  const fetchColleges = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/colleges`);
      if (!response.ok) {
        throw new Error('Failed to fetch colleges');
      }
      const data = await response.json();
      setAllColleges(data);
      setFilteredColleges(data);
      return data;
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setError('Failed to load colleges. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch colleges on component mount
  useEffect(() => {
    fetchColleges();
  }, []);
  
  // Function to refresh the college list
  const refreshColleges = async () => {
    const updatedColleges = await fetchColleges();
    // Re-apply current search to the updated list
    if (searchTerm) {
      handleSearch(searchTerm, updatedColleges);
    }
  };

  // Handle search
  const handleSearch = (term, collegesToSearch = allColleges) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredColleges(collegesToSearch);
      return;
    }

    const searchLower = term.toLowerCase();
    const filtered = collegesToSearch.filter(college => 
      college.name.toLowerCase().includes(searchLower)
    );
    
    setFilteredColleges(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-16 py-12 px-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
          Welcome to CATerview
        </h1>
        <p className="text-2xl md:text-3xl font-medium text-blue-100 max-w-3xl mx-auto">
          Share and discover verified B-school interview experiences
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <Search 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
        />
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Top B-Schools
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading colleges...</p>
            </div>
          ) : error ? (
            <div className="col-span-3 text-center py-8 text-gray-600">
              {searchTerm ? 'No matching colleges found. Try a different search term.' : 'No colleges found'}
            </div>
          ) : filteredColleges.length > 0 ? (
            filteredColleges.map((college) => (
              <Link 
                key={college.id}
                href={`/colleges?collegeId=${college.id}`}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {college.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      View Experiences
                    </span>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-600">
              {searchTerm ? 'No matching colleges found. Try a different search term.' : 'No colleges found'}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          How It Works
        </h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-50">
                1
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Submit Your Experience
              </h3>
              <p className="mt-2 text-gray-600">
                Share your interview experience with future aspirants
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-50">
                2
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Get Verified
              </h3>
              <p className="mt-2 text-gray-600">
                Our team verifies each experience for authenticity
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-50">
                3
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Help Others
              </h3>
              <p className="mt-2 text-gray-600">
                Your experience helps thousands of aspirants prepare better
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
