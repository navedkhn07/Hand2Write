import React, {useState, useEffect, useRef} from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function Login(){
  const headerRef = useRef(null)
  const formRef = useRef(null)
  const footerRef = useRef(null)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Header section animation
    const headerTl = gsap.timeline()
    headerTl.fromTo(headerRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    )

    // Form section animation
    const formTl = gsap.timeline({
      scrollTrigger: {
        trigger: formRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    formTl.fromTo(formRef.current.querySelectorAll('.form-content'), 
      { opacity: 0, y: 60, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.8, 
        ease: "back.out(1.7)",
        stagger: 0.2
      }
    )

    // Footer section animation
    const footerTl = gsap.timeline({
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 90%",
        end: "bottom 10%",
        toggleActions: "play none none reverse"
      }
    })
    
    footerTl.fromTo(footerRef.current.querySelectorAll('.footer-content'), 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        ease: "power2.out",
        stagger: 0.1
      }
    )

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if(error){ 
        alert(error.message)
        return 
      }
      
      const { data: profile, error: pErr } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if(pErr){ 
        alert(pErr.message)
        return 
      }
      
      if(profile.user_type === 'writer') navigate('/writer')
      else navigate('/student')
    } catch (error) {
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address first.')
      return
    }
    
    setIsResetLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) {
        alert(error.message)
      } else {
        alert('Password reset link sent to your email! Please check your inbox and click the link to reset your password.')
      }
    } catch (error) {
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section - Two Column Layout */}
        <div ref={headerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-12">
          {/* Left Side - Logo/Icon */}
          <div className="text-center lg:text-left">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full inline-flex items-center justify-center shadow-2xl mb-6 lg:mb-0">
              <span className="text-4xl">🔐</span>
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="lg:col-span-2 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4 drop-shadow-sm">
              Welcome Back
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
              Sign in to your Hand2Write account and continue your journey with our community.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div ref={formRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
          
          {/* Form Header */}
          <div className="form-content bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Sign In
            </h2>
            <p className="text-blue-100">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-8">
            
            {/* Email Field */}
            <div className="form-content mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">📧</span>
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="form-content mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Password
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
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-content flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              
              <button 
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetLoading || !email}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isResetLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                    Resetting...
                  </div>
                ) : (
                  'Forgot Password?'
                )}
              </button>
            </div>

            {/* Password Reset Note */}
            <div className="form-content mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>Password Reset:</strong> Enter your email above, then click "Forgot Password?" to receive a reset link in your inbox.
              </p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="form-content w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Additional Links */}
            <div className="footer-content mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Don't have an account yet?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/register?type=writer" 
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-lg"
                >
                  <span className="mr-2">✍️</span>
                  Join as Writer
                </a>
                <a 
                  href="/register?type=disabled" 
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl transition-all duration-200 hover:bg-purple-600 hover:text-white hover:shadow-lg"
                >
                  <span className="mr-2">🎓</span>
                  Join as Student
                </a>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Note */}
        <div ref={footerRef} className="footer-content text-center mt-8">
          <p className="text-gray-500 text-sm">
            Secure login powered by Supabase authentication
          </p>
        </div>

      </div>
    </div>
  )
}
