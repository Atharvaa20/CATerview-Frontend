'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCollege, setNewCollege] = useState({
    name: '',
    //logoUrl: '',
    //description: ''
  });
  const [editCollege, setEditCollege] = useState(null);

  const initializeEditCollege = (college) => {
    setEditCollege({
      id: college.id,
      name: college.name,
      //logoUrl: college.logoUrl,
      //description: college.description
    });
  };

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching colleges and experiences...');
      
      // Fetch all colleges and all experiences in parallel
      const [collegesResponse, experiencesResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/colleges`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/experiences`)
      ]);

      console.log('Colleges response:', collegesResponse.data);
      console.log('Experiences response:', experiencesResponse.data);

      if (collegesResponse.status !== 200) {
        throw new Error('Failed to fetch colleges');
      }
      
      // Get colleges and experiences from the responses
      const collegesData = collegesResponse.data?.data || [];
      // The experiences endpoint returns the array directly, not wrapped in a data property
      const allExperiences = Array.isArray(experiencesResponse.data) ? experiencesResponse.data : [];
      
      console.log('Colleges data:', collegesData);
      console.log('All experiences:', allExperiences);
      
      // Create a map of collegeId to experience count
      const experienceCounts = allExperiences.reduce((acc, exp) => {
        console.log('Processing experience:', exp);
        // Check if the experience has a collegeId property
        if (exp && exp.collegeId) {
          acc[exp.collegeId] = (acc[exp.collegeId] || 0) + 1;
          console.log(`Incremented count for college ${exp.collegeId}, new count:`, acc[exp.collegeId]);
        } else if (exp && exp.college && exp.college.id) {
          // Try with nested college object if direct collegeId is not available
          acc[exp.college.id] = (acc[exp.college.id] || 0) + 1;
          console.log(`Incremented count for college ${exp.college.id} (nested), new count:`, acc[exp.college.id]);
        }
        return acc;
      }, {});
      
      console.log('Experience counts:', experienceCounts);
      
      // Merge experience counts with colleges
      const collegesWithCounts = collegesData.map(college => {
        const count = experienceCounts[college.id] || 0;
        console.log(`College ${college.name} (${college.id}) has ${count} experiences`);
        return {
          ...college,
          experiences: count
        };
      });
      
      console.log('Final colleges data with counts:', collegesWithCounts);
      setColleges(collegesWithCounts);
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setError('Failed to fetch colleges. Please try again later.');
      setColleges([]); // Clear colleges on error
    } finally {
      setLoading(false);
    }
  };

  const handleNewCollege = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/colleges`, newCollege);
      if (response.status === 201) {
        setNewCollege({ name: ''});
        setShowForm(false);
        fetchColleges();
      } else {
        throw new Error('Failed to create college');
      }
    } catch (err) {
      console.error('Error creating college:', err);
      setError('Failed to create college. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCollege = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/colleges/${editCollege.id}`, editCollege);
      if (response.status === 200) {
        setEditCollege(null);
        setShowForm(false);
        fetchColleges();
      } else {
        throw new Error('Failed to update college');
      }
    } catch (err) {
      console.error('Error updating college:', err);
      setError('Failed to update college. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollege = async (college) => {
    if (!confirm('Are you sure you want to delete this college? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/colleges/${college.id}`);
      if (response.status === 200) {
        fetchColleges();
      } else {
        throw new Error('Failed to delete college');
      }
    } catch (err) {
      console.error('Error deleting college:', err);
      setError('Failed to delete college. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p>Loading colleges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
        <button
          onClick={fetchColleges}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">College Management</h1>

      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(true);
            setEditCollege(null);
            setNewCollege({ name: ''});
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New College
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editCollege ? 'Edit College' : 'Add New College'}
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={editCollege ? editCollege.name : newCollege.name}
                onChange={(e) => {
                  if (editCollege) {
                    setEditCollege({ ...editCollege, name: e.target.value });
                  } else {
                    setNewCollege({ ...newCollege, name: e.target.value });
                  }
                }}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
      
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditCollege(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editCollege) {
                    handleEditCollege();
                  } else {
                    handleNewCollege();
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editCollege ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Experiences
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.isArray(colleges) && colleges.length > 0 ? (
              colleges.map((college) => (
                college && college.id ? (
                  <tr key={college.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      {college.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        college.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        college.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {college.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      {college.experiences || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setShowForm(true);
                          setEditCollege(college);
                        }}
                        className="text-blue-500 hover:text-blue-600 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (!college.id) {
                            setError('Invalid college ID');
                            return;
                          }
                          handleDeleteCollege(college);
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ) : null
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No colleges found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
