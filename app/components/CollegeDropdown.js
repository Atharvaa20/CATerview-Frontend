'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/colleges`;

export default function CollegeDropdown({ 
  value, 
  onChange, 
  disabled = false,
  required = false,
  className = ''
}) {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const fetchColleges = useCallback(async () => {
    console.log('Fetching colleges from:', API_URL);
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('API Response Status:', response.status);
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        data = Object.values(response.data);
      }
      
      console.log('Processed colleges data:', data);
      
      if (!data || data.length === 0) {
        console.warn('No colleges data received or empty array');
      }
      
      setColleges(data || []);
      
    } catch (err) {
      const errorMsg = err.response 
        ? `Server responded with ${err.response.status}: ${err.response.statusText}`
        : err.request
        ? 'No response from server. Please check your connection.'
        : `Error: ${err.message}`;
      
      console.error('Error fetching colleges:', {
        error: err,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setError(`Failed to load colleges. ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const validateSelection = useCallback(() => {
    if (required && !value) {
      setValidationError('Please select a college');
      return false;
    }
    setValidationError('');
    return true;
  }, [required, value]);

  const handleChange = useCallback((e) => {
    const selectedValue = e.target.value;
    onChange(selectedValue);
    validateSelection();
  }, [onChange, validateSelection]);

  // Log state changes
  useEffect(() => {
    console.log('Colleges state updated:', colleges);
  }, [colleges]);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span>Loading colleges...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 ${className}`}>
        {error}
        <button
          onClick={fetchColleges}
          className="ml-2 text-blue-500 hover:text-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || loading}
        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          validationError ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100' : 'bg-white'}`}
      >
        <option value="">Select a college...</option>
        {Array.isArray(colleges) && colleges.length > 0 ? (
          [...colleges]
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            .map((college) => (
              <option key={college.id} value={college.id}>
                {college.name || `College ${college.id}`}
              </option>
            ))
        ) : (
          <option disabled>No colleges available</option>
        )}
      </select>
      {validationError && (
        <div className="text-red-500 text-sm mt-1">
          {validationError}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-1">
        {colleges.length} colleges loaded
      </div>
    </div>
  );
}
