import React, {useState, useEffect, useRef} from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useFormLogger, useErrorLogger } from '../hooks/useActivityLogger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function Register(){
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
    
    formTl.fromTo(formRef.current.querySelectorAll('.form-section'), 
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

  const [form, setForm] = useState({
    user_type: 'disabled',
    name:'', age:'', gender:'male', mobile:'', email:'', district:'', state:'', pincode:'', password:''
  })
  const navigate = useNavigate()
  const location = useLocation()
  
  // Initialize logging hooks
  const { logFormStart, logFormSuccess, logFormError } = useFormLogger('user_registration')
  const { logValidationError, logDatabaseError, logAuthError } = useErrorLogger()

  // Read query parameter and set user type on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const userType = searchParams.get('type')
    if (userType && (userType === 'writer' || userType === 'disabled')) {
      setForm(prev => ({ ...prev, user_type: userType }))
    }
  }, [location.search])

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value})

  // Form validation function
  const validateForm = (formData) => {
    const errors = []
    
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long')
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address')
    }
    
    if (!formData.password || formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long')
    }
    
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
      errors.push('Please enter a valid 10-digit mobile number')
    }
    
    if (!formData.age || formData.age < 16 || formData.age > 100) {
      errors.push('Age must be between 16 and 100')
    }
    
    if (!formData.district || formData.district.trim().length < 2) {
      errors.push('District must be at least 2 characters long')
    }
    
    if (!formData.state || formData.state.trim().length < 2) {
      errors.push('State must be at least 2 characters long')
    }
    
    if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
      errors.push('Please enter a valid 6-digit pincode')
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Log form submission start
    logFormStart()
    const startTime = Date.now()
    
    try {
      // Validate form data
      const validationErrors = validateForm(form)
      if (validationErrors.length > 0) {
        logFormError(form, validationErrors, Date.now() - startTime)
        logValidationError(`Registration validation failed: ${validationErrors.join(', ')}`, { form_data: form })
        alert('Please fix the following errors:\n' + validationErrors.join('\n'))
        return
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password
      })
      
      if (error) {
        const processingTime = Date.now() - startTime
        logFormError(form, [error.message], processingTime)
        logAuthError(`Registration failed: ${error.message}`, { form_data: form, error: error })
        alert(error.message)
        return
      }
      
      const { error: err2 } = await supabase.from('profiles').insert([{
      id: data.user.id,
      user_type: form.user_type,
      name: form.name,
      age: form.age,
      gender: form.gender,
      mobile: form.mobile,
      email: form.email,
      district: form.district,
      state: form.state,
      pincode: form.pincode,
      verified: false
    }])
    
    if (err2) {
      const processingTime = Date.now() - startTime
      logFormError(form, [err2.message], processingTime)
      logDatabaseError(`Profile creation failed: ${err2.message}`, err2.stack, { 
        user_id: data.user.id, 
        form_data: form,
        auth_success: true 
      })
      alert(err2.message)
      return
    }
    
    // Log successful registration
    const processingTime = Date.now() - startTime
    logFormSuccess(form, processingTime)
    
    alert('Registration successful! Please check your email to confirm.')
    if(form.user_type === 'writer') navigate('/writer')
    else navigate('/student')
    
  } catch (error) {
    // Log any unexpected errors
    const processingTime = Date.now() - startTime
    logFormError(form, [error.message], processingTime)
    logSystemError(`Unexpected registration error: ${error.message}`, error.stack, { 
      form_data: form,
      component: 'Register' 
    })
    alert('An unexpected error occurred. Please try again.')
    console.error('Registration error:', error)
  }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section - Two Column Layout */}
        <div ref={headerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-12">
          {/* Left Side - Logo/Icon */}
          <div className="text-center lg:text-left">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full inline-flex items-center justify-center shadow-2xl mb-6 lg:mb-0">
              <span className="text-5xl">✍️</span>
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="lg:col-span-2 text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-4 drop-shadow-sm">
              Join Hand2Write
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
              Connect with our community of writers and students. Start your journey today!
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div ref={formRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Form Header */}
          <div className="form-section bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Create Your Account
            </h2>
            <p className="text-blue-100">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            
            {/* User Type Selection */}
            <div className="form-section mb-8">
              <label className="block text-base font-semibold text-gray-700 mb-4">
                I want to join as:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setForm({...form, user_type: 'writer'})}
                  className={`p-6 border-2 rounded-xl transition-all duration-200 text-center ${
                    form.user_type === 'writer' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-3xl mb-2">✍️</div>
                  <div className="font-semibold mb-1">Writer</div>
                  <div className="text-sm opacity-70">Help students succeed</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setForm({...form, user_type: 'disabled'})}
                  className={`p-6 border-2 rounded-xl transition-all duration-200 text-center ${
                    form.user_type === 'disabled' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-3xl mb-2">🎓</div>
                  <div className="font-semibold mb-1">Student</div>
                  <div className="text-sm opacity-70">Get writing help</div>
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="form-section bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-sm">👤</span>
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    required
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Age"
                    type="number"
                    min="13"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-white transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 text-sm">📧</span>
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    required
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="form-section bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 text-sm">📍</span>
                Location Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="Enter district"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="Enter PIN code"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="form-section bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 text-sm">🔐</span>
                Security
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  required
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="form-section w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-105"
            >
              Create Account
            </button>

            {/* Login Link */}
            <div className="footer-content text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700 underline">
                  Sign in here
                </a>
              </p>
            </div>

          </form>
        </div>

        {/* Footer Note */}
        <div ref={footerRef} className="footer-content text-center mt-8">
          <p className="text-gray-500 text-sm">
            Secure registration powered by Supabase authentication
          </p>
        </div>

      </div>
    </div>
  )
}
