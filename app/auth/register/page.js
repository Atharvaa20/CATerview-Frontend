'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { 
  LockOpenIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  ArrowPathIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Password strength indicator component
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  
  const getStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]+/)) strength++;
    if (pwd.match(/[A-Z]+/)) strength++;
    if (pwd.match(/[0-9]+/)) strength++;
    if (pwd.match(/[!@#$%^&*(),.?":{}|<>]+/)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength - 1] || '';
  const strengthColor = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ][strength - 1] || 'bg-gray-200';

  return (
    <div className="mt-2">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        Password strength: <span className="font-medium">{strengthText}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${strengthColor} transition-all duration-300`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
      {password && (
        <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <li className={`flex items-center ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            {password.length >= 8 ? (
              <CheckCircleIcon className="h-3 w-3 mr-1.5" />
            ) : (
              <XCircleIcon className="h-3 w-3 mr-1.5" />
            )}
            At least 8 characters
          </li>
          <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            {/\d/.test(password) ? (
              <CheckCircleIcon className="h-3 w-3 mr-1.5" />
            ) : (
              <XCircleIcon className="h-3 w-3 mr-1.5" />
            )}
            At least one number
          </li>
          <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            {/[A-Z]/.test(password) ? (
              <CheckCircleIcon className="h-3 w-3 mr-1.5" />
            ) : (
              <XCircleIcon className="h-3 w-3 mr-1.5" />
            )}
            At least one uppercase letter
          </li>
        </ul>
      )}
    </div>
  );
};

// Custom input component for better reusability
const FormInput = ({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  error, 
  required = false,
  showPasswordToggle = false,
  onTogglePassword = null,
  className = ''
}) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative mt-1 rounded-md shadow-sm">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-10 py-3 border ${
          error ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' 
          : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
        } rounded-md shadow-sm transition duration-150 ease-in-out`}
        placeholder={placeholder}
        required={required}
      />
      {showPasswordToggle && onTogglePassword && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={onTogglePassword}
          tabIndex="-1"
        >
          {type === 'password' ? (
            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

console.log('Rendering RegisterPage');

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVerificationStep, setIsVerificationStep] = useState(false)
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  
  // Countdown timer for resend OTP
  useEffect(() => {
    console.log('Countdown effect running, countdown:', countdown);
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => {
      console.log('Clearing countdown timer');
      clearTimeout(timer);
    }
  }, [countdown])
  
  // Debug effect to track OTP changes
  useEffect(() => {
    console.log('OTP changed:', otp);
  }, [otp]);
  
  // Debug effect to track verification step changes
  useEffect(() => {
    console.log('isVerificationStep changed:', isVerificationStep);
    if (isVerificationStep) {
      console.log('Reset verification state');
      setVerificationAttempted(false);
    }
  }, [isVerificationStep]);

  const validateForm = () => {
    // Reset errors
    setError('')

    // Name validation
    if (!name.trim()) {
      setError('Name is required')
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return false
    }

    // Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      return false
    }

    if (!/(?=.*[0-9])/.test(password)) {
      setError('Password must contain at least one number')
      return false
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setIsVerificationStep(true)
      setCountdown(60) // 60 seconds cooldown for resend OTP
      setSuccess('Verification OTP sent to your email')
    } catch (err) {
      setError(err.message || 'Registration failed')
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('=== handleVerifyOtp called ===');
    setIsVerifying(true);
    setError('');
    
    const otpValue = otp.join('');
    console.log('OTP to verify:', otpValue);
    
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setIsVerifying(false);
      return;
    }

    try {
      console.log('Sending verification request...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpValue,
        }),
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed. Please check the code and try again.');
      }

      // Auto-login after successful verification
      await login(email, password);
      router.push('/');
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    
    setIsResending(true)
    setError('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }

      setCountdown(60) // Reset cooldown
      setSuccess('New OTP sent to your email')
    } catch (err) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  // Simple form submit handler that does nothing
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Form submission prevented');
    return false;
  };
  
  // State to track if verification has been attempted
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  if (isVerificationStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Verify Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              We've sent a 6-digit verification code to
            </p>
            <p className="font-medium text-blue-600 dark:text-blue-400">
              {email}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleFormSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <div className="flex justify-center space-x-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        required
                        className="w-12 h-12 text-2xl text-center border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={otp[index] || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value || e.target.value === '') {
                            const newOtp = [...otp];
                            newOtp[index] = value.slice(-1);
                            setOtp(newOtp);
                            // Move to next input if a digit was entered
                            if (value && index < 5) {
                              document.getElementById(`otp-${index + 1}`)?.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          // Handle backspace to move to previous input
                          if (e.key === 'Backspace' && !otp[index] && index > 0) {
                            document.getElementById(`otp-${index - 1}`)?.focus();
                          }
                          // Prevent form submission on Enter
                          if (e.key === 'Enter') {
                            e.preventDefault();
                          }
                        }}
                        id={`otp-${index}`}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setOtp(Array(6).fill(''));
                  setIsVerificationStep(false);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
              >
                ← Back to registration
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifying || otp.join('').length !== 6}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {isVerifying ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResending}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                'Sending...'
              ) : countdown > 0 ? (
                `Resend code in ${countdown}s`
              ) : (
                'Resend verification code'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <form 
          className="mt-8 space-y-4" 
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister(e);
          }}
        >
          <FormInput
            id="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            icon={UserIcon}
            required
            error={error && error.includes('name') ? error : ''}
          />
          
          <FormInput
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={EnvelopeIcon}
            required
            error={error && error.includes('email') ? error : ''}
          />
          
          <div>
            <FormInput
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={LockOpenIcon}
              required
              showPasswordToggle
              onTogglePassword={() => setShowPassword(!showPassword)}
              error={error && error.includes('password') ? error : ''}
            />
            <PasswordStrength password={password} />
          </div>
          
          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            icon={LockOpenIcon}
            required
            showPasswordToggle
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            error={error && error.includes('match') ? 'Passwords do not match' : ''}
          />
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isSubmitting ? (
                  <ArrowPathIcon className="h-5 w-5 text-blue-400 group-hover:text-blue-300 animate-spin" />
                ) : (
                  <LockOpenIcon className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                )}
              </span>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
            
            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Privacy Policy
              </a>
            </div>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                By signing up, you agree to our
              </span>
            </div>
          </div>
          
          <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
