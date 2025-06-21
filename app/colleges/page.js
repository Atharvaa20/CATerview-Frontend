'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

function ExperienceItem({ experience, collegeId }) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/experience/${experience.id}`);
  };

  // Safely get profile data with defaults
  const profile = experience.profile || {};
  const stream = profile.stream || 'Not specified';
  const workExp = profile.workExperience || '0';
  const catPercentile = profile.catPercentile || 'N/A';
  const category = profile.category || 'Not specified';

  return (
    <div 
      className="mt-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition-shadow"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-800">
            <span className="text-gray-600">Interview Experience By </span>
            <span className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
              {experience.user?.name || 'Anonymous'}
            </span>
          </h3>
          
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <AcademicCapIcon className="h-3 w-3 mr-1 text-gray-400" />
              <span>{stream}</span>
            </div>
            <div className="flex items-center">
              <BriefcaseIcon className="h-3 w-3 mr-1 text-gray-400" />
              <span>{workExp} {workExp === '1' ? 'year' : 'years'} exp</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">CAT:</span>
              <span className="ml-1">{catPercentile}%ile</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Result:</span>
              <span className="ml-1">{category}</span>
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex-shrink-0">
          {experience.isVerified ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <ClockIcon className="h-3 w-3 mr-1" />
              Pending
            </span>
          )}
          
          <p className="mt-2 text-xs text-gray-500 flex items-center justify-end">
            <CalendarIcon className="h-3 w-3 mr-1 text-gray-400" />
            {new Date(experience.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {experience.watSummary && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 line-clamp-2">
            {experience.watSummary}
          </p>
        </div>
      )}
    </div>
  );
}

function CollegeCard({ college }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasExperiences = college.experiences && college.experiences.length > 0;

  // Handle click on the college card
  const handleCardClick = (e) => {
    // Prevent any default behavior that might cause navigation
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    // Only toggle if there are experiences
    if (hasExperiences) {
      setIsExpanded(prev => !prev);
    }
    return false;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      onClick={handleCardClick}
    >
      <div 
        className={`w-full p-4 flex items-center justify-between ${hasExperiences ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}`}
      >
        <div className="w-full flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {college.name}
          </h2>
          {hasExperiences ? (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {college.experiences.length} {college.experiences.length === 1 ? 'experience' : 'experiences'}
              </span>
              <ChevronDownIcon 
                className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
                aria-hidden="true" 
              />
            </div>
          ) : (
            <span className="text-sm text-gray-500">No experiences yet</span>
          )}
        </div>
      </div>
      
      {isExpanded && hasExperiences && (
        <div className="px-4 pb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            <BriefcaseIcon className="h-4 w-4 mr-1" />
            Interview Experiences
          </h3>
          <div className="space-y-2">
            {college.experiences.map((exp) => (
              <ExperienceItem key={exp._id} experience={exp} collegeId={college.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CollegesPage() {
  const searchParams = useSearchParams();
  const collegeId = searchParams.get('collegeId');
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the list of colleges
        const collegesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/colleges`);
        if (!collegesResponse.ok) {
          throw new Error('Failed to fetch colleges');
        }
        const collegesData = await collegesResponse.json();
        setColleges(collegesData);

        // If a collegeId is provided in the URL, fetch its experiences
        if (collegeId) {
          const college = collegesData.find(c => c.id.toString() === collegeId);
          if (college) {
            const experiences = await fetchCollegeExperiences(college);
            setSelectedCollege({
              ...college,
              experiences: Array.isArray(experiences) ? experiences : []
            });
          }
        } else {
          // Otherwise, fetch experiences for all colleges
          const collegesWithExps = await Promise.all(
            collegesData.map(async (college) => {
              const experiences = await fetchCollegeExperiences(college);
              return { ...college, experiences };
            })
          );
          setFilteredColleges(collegesWithExps);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error in fetchData:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCollegeExperiences = async (college) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/colleges/${college.id}/experiences`
        );
        
        if (!response.ok) {
          console.error(`Failed to fetch experiences for college ${college.name} (ID: ${college.id})`);
          return [];
        }
        
        const data = await response.json();
        console.log('Fetched experiences:', data); // Debug log
        return Array.isArray(data) ? data : data || [];
      } catch (err) {
        console.error(`Error fetching experiences for college ${college.name}:`, err);
        return [];
      }
    };

    fetchData();
  }, [collegeId]);

  // Sort colleges by number of experiences (descending)
  const sortedColleges = [...filteredColleges].sort(
    (a, b) => (b.experiences?.length || 0) - (a.experiences?.length || 0)
  );
  
  // Filter out colleges with no experiences
  const collegesWithExperience = sortedColleges.filter(college => 
    college.experiences?.length > 0
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          {selectedCollege && (
            <Link 
              href="/"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          )}
        </div>
        <h1 className="text-3xl font-bold text-black-900">
          {selectedCollege 
            ? `Interview Experiences - ${selectedCollege.name}` 
            : 'Interview Experiences by College'}
        </h1>
        <p className="mt-2 text-gray-600">
          {selectedCollege
            ? `Browse interview experiences shared by students from ${selectedCollege.name}`
            : 'Browse interview experiences shared by students from different colleges'}
        </p>
      </div>

      {selectedCollege ? (
        <div className="space-y-6">
          {selectedCollege.experiences?.length > 0 ? (
            <div className="space-y-4">
              {selectedCollege.experiences.map((experience) => (
                <ExperienceItem 
                  key={experience.id} 
                  experience={experience} 
                  collegeId={selectedCollege.id} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No interview experiences found for this college.</p>
            </div>
          )}
        </div>
      ) : collegesWithExperience.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {collegesWithExperience.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {colleges.length > 0 ? 'No interview experiences available' : 'No colleges found'}
          </h3>
          <p className="mt-1 text-gray-500">
            {colleges.length > 0 
              ? 'Check back later or be the first to share your experience!'
              : 'There are currently no colleges in the system.'}
          </p>
          {colleges.length > 0 && (
            <div className="mt-6">
              <Link
                href="/share-experience"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BriefcaseIcon className="-ml-1 mr-2 h-5 w-5" />
                Share Your Experience
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
