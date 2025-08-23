import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isValidToken, setIsValidToken] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Simple approach: just check if we can get the user
    // This will work if the reset link has already authenticated the user
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (user && !error) {
          console.log('User authenticated:', user)
          setIsValidToken(true)
          setMessage('Please enter your new password.')
        } else {
          console.log('No user found, checking URL for tokens...')
          
          // Check URL for any tokens
          const hashParams = new URLSearchParams(location.hash.substring(1))
          const queryParams = new URLSearchParams(location.search)
          
          console.log('Hash params:', location.hash)
          console.log('Query params:', location.search)
          console.log('Full URL:', window.location.href)
          
          // Look for any token-like parameters
          const token = hashParams.get('token') || 
                       queryParams.get('token') ||
                       hashParams.get('recovery_token') ||
                       queryParams.get('recovery_token') ||
                       hashParams.get('access_token') ||
                       queryParams.get('access_token')
          
          if (token) {
            console.log('Token found, attempting to use it...')
            // Try to use the token to authenticate
            const { data, error: tokenError } = await supabase.auth.verifyOtp({
              token: token,
              type: 'recovery'
            })
            
            if (tokenError) {
              console.error('Token verification failed:', tokenError)
              setMessage('Invalid or expired reset link. Please request a new one.')
            } else {
              console.log('Token verification successful:', data)
              // Set the session properly so the user is authenticated
              if (data.session) {
                await supabase.auth.setSession(data.session)
              }
              setIsValidToken(true)
              setMessage('Please enter your new password.')
            }
          } else {
            setMessage('Invalid reset link. Please check your email for the correct link or request a new one.')
          }
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setMessage('An error occurred. Please try again or request a new reset link.')
      }
    }
    
    checkUser()
    
    // Also listen for auth state changes in case the reset link authenticates the user
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (session?.user) {
          console.log('User authenticated via reset link:', session.user)
          // Ensure the session is properly set
          supabase.auth.setSession(session)
          setIsValidToken(true)
          setMessage('Please enter your new password.')
        }
      }
    })
    
    return () => subscription.unsubscribe()
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }
    
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.')
      return
    }
    
    setIsLoading(true)
    setMessage('')
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        setMessage(error.message)
      } else {
        // Refresh the session to ensure it's valid
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.error('Session refresh error:', refreshError)
        }
        
        setMessage('Password updated successfully! Redirecting to login...')
        setTimeout(() => {
          // Sign out the user to force them to login with new password
          supabase.auth.signOut()
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-8 py-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Reset Link Invalid
              </h2>
              <p className="text-red-100">
                The password reset link is invalid or has expired
              </p>
            </div>
            
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Reset Link Issue</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <a 
                href="/login" 
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-400 rounded-full inline-flex items-center justify-center shadow-2xl mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              New Password
            </h2>
            <p className="text-green-100">
              Choose a strong, secure password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            
            {/* New Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔒</span>
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Password must be at least 6 characters long
              </p>
            </div>
            
            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">✅</span>
                </div>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 hover:from-green-700 hover:to-blue-700 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Updating Password...
                </div>
              ) : (
                'Update Password'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center mt-6">
              <a 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                ← Back to Login
              </a>
            </div>

          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Secure password reset powered by Supabase
          </p>
        </div>

      </div>
    </div>
  )
}
