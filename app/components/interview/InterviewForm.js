'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import CollegeDropdown from '../CollegeDropdown'

export default function InterviewForm() {
  const { user } = useAuth()
  const [piQuestions, setPiQuestions] = useState([{ question: '', answer: '' }])
  const [error, setError] = useState('')
  const [selectedCollegeId, setSelectedCollegeId] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setError('')

    if (!user) {
      setError('Please login to submit an interview experience')
      return
    }
    
    if (!selectedCollegeId) {
      setError('Please select a college')
      return
    }

    // Filter out empty questions
    const validPiQuestions = piQuestions.filter(
      q => q.question.trim() !== '' && q.answer.trim() !== ''
    );

    if (validPiQuestions.length === 0) {
      setError('Please add at least one PI question and answer')
      return
    }

    try {
      const formData = {
        ...data,
        collegeId: selectedCollegeId,
        piQuestions: validPiQuestions,
        userId: user.id,
      };

      console.log('Creating experience with data:', formData);
      
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/experiences/submit`, formData);

      alert('Experience submitted successfully! It will be reviewed by our team.');
      // Reset form
      setSelectedCollegeId('');
      setPiQuestions([{ question: '', answer: '' }]);
    } catch (err) {
      console.error('Error creating experience:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.error || 'Failed to submit experience');
      }
    }
  }

  const addQuestion = () => {
    setPiQuestions([...piQuestions, { question: '', answer: '' }])
  }

  const removeQuestion = (index) => {
    setPiQuestions(piQuestions.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Submit Interview Experience
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              College Name *
            </label>
            <div className="mt-1">
              <CollegeDropdown
                value={selectedCollegeId}
                onChange={(value) => {
                  setSelectedCollegeId(value);
                  setValue('collegeId', value, { shouldValidate: true });
                }}
                required
              />
            </div>
            {!selectedCollegeId && errors.collegeId && (
              <p className="mt-1 text-sm text-red-600">Please select a college</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Year *
            </label>
            <select
              {...register('year', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select year</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">This field is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Information
            </label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stream
                </label>
                <input
                  {...register('profile.stream', { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Engineering, Commerce"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Result
                </label>
                <input
                  {...register('profile.category', { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Converted, Waitlisted, Rejected"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Work Experience (years)
                </label>
                <input
                  {...register('profile.workExperience', { 
                    required: true,
                    min: 0,
                    valueAsNumber: true
                  })}
                  type="number"
                  step="0.1"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CAT Percentile
                </label>
                <input
                  {...register('profile.catPercentile', { 
                    required: true,
                    min: 0,
                    max: 100,
                    valueAsNumber: true
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 99.5"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                WAT Summary
              </label>
              <span className="text-xs text-gray-500">
                {watch('watSummary')?.length || 0}/5000 characters
              </span>
            </div>
            <textarea
              {...register('watSummary', {
                maxLength: 5000
              })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Brief summary of your Written Ability Test..."
            />
            {errors.watSummary && (
              <p className="mt-1 text-sm text-red-600">
                WAT Summary cannot exceed 5000 characters
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Personal Interview Questions
            </h3>
            {piQuestions.map((questionData, index) => (
              <div key={index} className="border-b pb-4 mb-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Question {index + 1}
                    </label>
                    <input
                      value={piQuestions[index]?.question || ''}
                      onChange={(e) => {
                        const newQuestions = [...piQuestions];
                        newQuestions[index] = {
                          ...newQuestions[index],
                          question: e.target.value
                        };
                        setPiQuestions(newQuestions);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter question..."
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Your Answer
                    </label>
                    <textarea
                      value={piQuestions[index]?.answer || ''}
                      onChange={(e) => {
                        const newQuestions = [...piQuestions];
                        newQuestions[index] = {
                          ...newQuestions[index],
                          answer: e.target.value
                        };
                        setPiQuestions(newQuestions);
                      }}
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Your answer..."
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="mt-8 text-red-600 hover:text-red-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="text-blue-600 hover:text-blue-500"
            >
              <PlusIcon className="h-5 w-5 inline-block" />
              Add Another Question
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Final Remarks
              </label>
              <span className="text-xs text-gray-500">
                {watch('finalRemarks')?.length || 0}/1000 characters
              </span>
            </div>
            <textarea
              {...register('finalRemarks', {
                maxLength: 1000
              })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any additional comments or advice..."
            />
            {errors.finalRemarks && (
              <p className="mt-1 text-sm text-red-600">
                Final Remarks cannot exceed 1000 characters
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Experience
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
