import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Register from './pages/Register'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import StudentProfile from './pages/StudentProfile'
import WriterProfile from './pages/WriterProfile'
import Admin from './pages/Admin'
import ChatWidget from './ChatWidget'

export default function App(){
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  // Function to fetch user type from database
  const fetchUserType = async (userId) => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single()
      
      if (error) {
        return
      }
      
      setUserType(data.user_type)
    } catch (error) {
      // Silent error handling
    }
  }

  useEffect(() => {
    // Get initial user session
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          fetchUserType(user.id)
        }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchUserType(session.user.id)
        } else {
          setUserType(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error logging out:', error)
        alert('Error logging out: ' + error.message)
      } else {
        navigate('/')
      }
    } catch (error) {
      console.error('Error logging out:', error)
      alert('Error logging out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }



  return (
    <div>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link className="flex items-center space-x-3 group" to="/">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <span className="text-2xl">✍️</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Hand2Write
                </span>
              </div>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link 
                to="/" 
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <span className="text-lg">🏠</span>
                <span>Home</span>
              </Link>
              <Link 
                to="/about" 
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <span className="text-lg">ℹ️</span>
                <span>About</span>
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <span className="text-lg">📞</span>
                <span>Contact</span>
              </Link>
              {user && userType === 'writer' && (
                <Link 
                  to="/writer" 
                  className="px-4 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  <span className="text-lg">✍️</span>
                  <span>Writer Profile</span>
                </Link>
              )}
              {user && (userType === 'student' || userType === 'disabled') && (
                <Link 
                  to="/student" 
                  className="px-4 py-2 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  <span className="text-lg">🎓</span>
                  <span>Student Profile</span>
                </Link>
              )}
              {user && user.email === 'admin@example.com' && (
                <Link 
                  to="/admin" 
                  className="px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  <span className="text-lg">⚙️</span>
                  <span>Admin</span>
                </Link>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <span className="text-2xl">
                  {mobileMenuOpen ? '✕' : '☰'}
                </span>
              </button>
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{user.email}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {userType === 'disabled' ? 'Student' : userType}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="flex items-center space-x-2">
                      <span>🚪</span>
                      <span>Logout</span>
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-200"
                  >
                    Register
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <Link 
                to="/" 
                className="block px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium flex items-center space-x-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">🏠</span>
                <span>Home</span>
              </Link>
              <Link 
                to="/about" 
                className="block px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium flex items-center space-x-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">ℹ️</span>
                <span>About</span>
              </Link>
              <Link 
                to="/contact" 
                className="block px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium flex items-center space-x-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">📞</span>
                <span>Contact</span>
              </Link>
              {user && userType === 'writer' && (
                <Link 
                  to="/writer" 
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 font-medium flex items-center space-x-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-xl">✍️</span>
                  <span>Writer Profile</span>
                </Link>
              )}
              {user && (userType === 'student' || userType === 'disabled') && (
                <Link 
                  to="/student" 
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 font-medium flex items-center space-x-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-xl">🎓</span>
                  <span>Student Profile</span>
                </Link>
              )}
              {user && user.email === 'admin@example.com' && (
                <Link 
                  to="/admin" 
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium flex items-center space-x-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-xl">⚙️</span>
                  <span>Admin</span>
                </Link>
              )}
              
              {/* Mobile auth section */}
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.email}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {userType === 'disabled' ? 'Student' : userType}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>🚪</span>
                      <span>Logout</span>
                    </span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link 
                    to="/register" 
                    className="block w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-200 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                  <Link 
                    to="/login" 
                    className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/reset-password" element={<ResetPassword/>}/>
          <Route path="/student" element={<StudentProfile/>}/>
          <Route path="/writer" element={<WriterProfile/>}/>
          <Route path="/admin" element={<Admin/>}/>
        </Routes>
      </div>
      <ChatWidget />
    </div>
  )
}
