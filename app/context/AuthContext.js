'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext({
  user: null,
  loading: true,
  isAdmin: false,
  login: () => Promise.reject(),
  logout: () => {},
  checkAuth: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Axios interceptor for all requests
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setIsAdmin(false);
        return;
      }

      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user) {
        throw new Error('No user found in localStorage');
      }

      // Set user from localStorage
      setUser(user);
      setIsAdmin(user.role === 'admin');
      
      // We're not verifying the token with the backend since the endpoint doesn't exist
      // All authentication is handled client-side using the token and user data in localStorage
      
    } catch (error) {
      console.error('Error checking auth:', error);
      // Clear auth on any error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        email,
        password,
      })
      if (response.status !== 200) {
        throw new Error('Login failed')
      }
      const { token, user } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      setIsAdmin(user.role === 'admin')
      return true
    } catch (error) {
      console.error('Login error:', error)
      throw error.response?.data?.message || 'Login failed'
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
