import React, {useEffect, useState, useRef} from 'react'
import { supabase } from '../supabaseClient'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function WriterProfile(){
  // Animation refs
  const heroRef = useRef(null)
  const tabsRef = useRef(null)
  const profileRef = useRef(null)
  const notificationsRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [realtimeEnabled, setRealtimeEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [selectedNotifications, setSelectedNotifications] = useState(new Set())

  useEffect(()=>{ 
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setProfile(null);
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    };
    getProfile();
  },[])

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab])

  useEffect(()=>{
    if(profile) {
      subscribeNotifications()
    }
  },[profile])

  // Fallback: periodic refresh when realtime is disabled
  useEffect(() => {
    let interval
    if (profile && !realtimeEnabled) {
      // Refresh every 30 seconds when realtime is disabled
      interval = setInterval(fetchMyNotifications, 30000)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [profile, realtimeEnabled])

  // GSAP animations
  useEffect(() => {
    // Hero section animation
    if (heroRef.current) {
      const heroTl = gsap.timeline()
      heroTl.fromTo(heroRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      )
    }

    // Tabs animation
    if (tabsRef.current) {
      const tabsTl = gsap.timeline({
        scrollTrigger: {
          trigger: tabsRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      })
      tabsTl.fromTo(tabsRef.current.querySelectorAll('button'),
        { opacity: 0, y: 30, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.1 }
      )
    }

    // Profile section animation
    if (profileRef.current) {
      const profileTl = gsap.timeline({
        scrollTrigger: {
          trigger: profileRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      })
      profileTl.fromTo(profileRef.current.querySelectorAll('.profile-content'),
        { opacity: 0, y: 60, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)', stagger: 0.2 }
      )
    }

    // Notifications section animation
    if (notificationsRef.current) {
      const notificationsTl = gsap.timeline({
        scrollTrigger: {
          trigger: notificationsRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      })
      notificationsTl.fromTo(notificationsRef.current.querySelectorAll('.notification-item'),
        { opacity: 0, y: 40, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.3)', stagger: 0.1 }
      )
    }

    // Cleanup and refresh
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [profile, activeTab, notifications.length])

  async function fetchProfile(){
    const u = (await supabase.auth.getUser()).data.user
    if(!u) return
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).single()
    setProfile(data)
  }

  async function subscribeNotifications(){
    try {
      // Clean up any existing subscription
      supabase.removeAllChannels()
      
      // Create a new channel with proper error handling
      const channel = supabase.channel('writer-notifications')
        .on('postgres_changes', {
          event: '*', 
          schema: 'public', 
          table: 'notifications'
        }, payload => {
          console.log('Writer notification change:', payload)
          fetchMyNotifications()
        })
        .on('error', (error) => {
          console.error('Supabase realtime error:', error)
        })
        .on('disconnect', () => {
          console.log('Supabase realtime disconnected')
        })
      
      // Subscribe with timeout and error handling
      const { data, error } = await channel.subscribe()
      
      if (error) {
        console.error('Failed to subscribe to notifications:', error)
        setRealtimeEnabled(false)
        // Fallback: just fetch notifications without realtime
        fetchMyNotifications()
        return
      }
      
      console.log('Successfully subscribed to notifications')
      setRealtimeEnabled(true)
      
      // Initial fetch
      fetchMyNotifications()
    } catch (error) {
      console.error('Error in subscribeNotifications:', error)
      setRealtimeEnabled(false)
      // Fallback: just fetch notifications without realtime
      fetchMyNotifications()
    }
  }

  async function fetchMyNotifications(){
    try {
      const u = (await supabase.auth.getUser()).data.user
      if(!u) return
      
      // fetch notifications where writer_id == current writer
      const { data, error } = await supabase.from('notifications').select('*').eq('writer_id', u.id).order('created_at',{ascending:false})
      if(error) {
        console.error('Error fetching notifications:', error)
        return
      }
      
      if(!data || data.length === 0){ 
        setNotifications([])
        return 
      }
      
      // Enrich each notification with student and exam info
      const enriched = await Promise.all(data.map(async n=>{
        let exam = null
        let student = null
        
        // Fetch student details
        if(n.student_id){
          const { data: studentData } = await supabase.from('profiles').select('name, mobile, email').eq('id', n.student_id).single()
          student = studentData || null
        }
        
        // Fetch exam details
        if(n.exam_id){
          const { data: ex } = await supabase.from('exam_info').select('*').eq('id', n.exam_id).single()
          exam = ex || null
        }
        
        return {...n, exam, student}
      }))
      setNotifications(enriched || [])
    } catch (error) {
      console.error('Error in fetchMyNotifications:', error)
    }
  }

  const respond = async (id, status) => {
    const { error } = await supabase.from('notifications').update({status}).eq('id', id)
    if(error) {
      alert('Error updating status: ' + error.message)
      return
    }
    alert('Successfully updated: ' + status)
    fetchMyNotifications()
  }

  const cancelAssistance = async (id, studentName) => {
    if(!confirm(`Are you sure you want to decline assistance for ${studentName}? This will allow them to request help from other writers.`)) return
    
    const { error } = await supabase.from('notifications').update({status: 'rejected'}).eq('id', id)
    if(error) {
      alert('Error declining assistance: ' + error.message)
      return
    }
    
    alert('Assistance declined. The student can now request help from other writers.')
    fetchMyNotifications()
  }

  const deleteNotification = async (notificationId, studentName, examName) => {
    if(!confirm(`Are you sure you want to delete this notification from ${studentName} for ${examName}?`)) return
    
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', notificationId)
      if(error) throw error
      
      alert('Notification deleted successfully')
      fetchMyNotifications()
    } catch (error) {
      alert('Error deleting notification: ' + error.message)
    }
  }

  const deleteSelectedNotifications = async () => {
    if(selectedNotifications.size === 0) {
      alert('Please select notifications to delete')
      return
    }
    
    if(!confirm(`Are you sure you want to delete ${selectedNotifications.size} selected notification(s)?`)) return
    
    try {
      const notificationIds = Array.from(selectedNotifications)
      const { error } = await supabase.from('notifications').delete().in('id', notificationIds)
      if(error) throw error
      
      alert(`${selectedNotifications.size} notification(s) deleted successfully`)
      setSelectedNotifications(new Set())
      fetchMyNotifications()
    } catch (error) {
      alert('Error deleting notifications: ' + error.message)
    }
  }

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev)
      if(newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }

  const selectAllNotifications = () => {
    setSelectedNotifications(new Set(notifications.map(n => n.id)))
  }

  const clearSelection = () => {
    setSelectedNotifications(new Set())
  }

  // Helper functions for status styling
  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'completed'
      case 'accepted': return 'accepted'
      case 'rejected': return 'declined'
      case 'pending': return 'received your request for'
      case 'cancelled': return 'cancelled your request for'
      default: return 'updated'
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div ref={heroRef} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✍️</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.name}!</h1>
            <p className="text-blue-100 text-lg">Manage your assistance requests and help students succeed</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div ref={tabsRef} className="flex flex-wrap justify-center mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            📋 Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🔔 Notifications
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div ref={profileRef} className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="text-3xl mr-3">👤</span>
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <div className="profile-content flex items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mr-3">📧</span>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <div className="profile-content flex items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mr-3">📱</span>
                    <div>
                      <p className="text-sm text-gray-500">Mobile</p>
                      <p className="font-medium">{profile.mobile}</p>
                    </div>
                  </div>
                  <div className="profile-content flex items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mr-3">🎂</span>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{profile.age} years</p>
                    </div>
                  </div>
                  <div className="profile-content flex items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mr-3">👥</span>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium capitalize">{profile.gender}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="text-3xl mr-3">📍</span>
                  Location Details
                </h2>
                <div className="space-y-4">
                  <div className="profile-content flex items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mr-3">🏛️</span>
                    <div>
                      <p className="text-sm text-gray-500">District</p>
                      <p className="font-medium">{profile.district}</p>
                    </div>
                  </div>
                  <div className="profile-content flex items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mr-3">🗺️</span>
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-medium">{profile.state}</p>
                    </div>
                  </div>
                  <div className="profile-content flex items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mr-3">📮</span>
                    <div>
                      <p className="text-sm text-gray-500">PIN Code</p>
                      <p className="font-medium">{profile.pincode}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mr-3">✍️</span>
                    <div>
                      <p className="text-sm text-gray-500">Account Type</p>
                      <p className="font-medium capitalize">{profile.user_type}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div ref={notificationsRef} className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-3xl mr-3">🔔</span>
                Assistance Requests
              </h2>
              <div className="flex items-center space-x-3">
                {!realtimeEnabled && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Manual Mode
                  </span>
                )}
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  onClick={fetchMyNotifications}
                  title="Refresh notifications"
                >
                  🔄 Refresh
                </button>
                {notifications.length > 0 && (
                  <div className="flex items-center space-x-3">
                    {selectedNotifications.size > 0 && (
                      <>
                        <span className="text-sm text-gray-600">
                          {selectedNotifications.size} selected
                        </span>
                        <button
                          onClick={deleteSelectedNotifications}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          🗑️ Delete Selected
                        </button>
                        <button
                          onClick={clearSelection}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                        >
                          Clear Selection
                        </button>
                      </>
                    )}
                    <button
                      onClick={selectAllNotifications}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Select All
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {notifications.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 text-lg">No assistance requests yet.</p>
                <p className="text-gray-500">You'll see requests here when students need your help.</p>
              </div>
            )}
            
            <div className="space-y-4">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`notification-item p-6 rounded-xl border-l-4 ${
                    selectedNotifications.has(n.id) ? 'ring-2 ring-blue-500 bg-blue-50' :
                    n.status === 'completed' ? 'border-l-green-500 bg-green-50' :
                    n.status === 'accepted' ? 'border-l-blue-500 bg-blue-50' :
                    n.status === 'rejected' ? 'border-l-red-500 bg-red-50' :
                    n.status === 'pending' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-gray-500 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(n.id)}
                      onChange={() => toggleNotificationSelection(n.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      {n.student && (
                        <div className="mb-3">
                          <p className="text-gray-800">
                            <span className="font-bold">{n.student.name}</span> has requested your assistance for an exam:
                          </p>
                        </div>
                      )}
                      
                      {n.exam && (
                        <div className="mb-4 p-4 bg-white rounded-lg">
                          <h4 className="font-bold text-gray-800 mb-2">📝 Exam Details:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <p><span className="font-medium">Name:</span> {n.exam.name}</p>
                            <p><span className="font-medium">Date:</span> {n.exam.date}</p>
                            <p><span className="font-medium">Center:</span> {n.exam.center}</p>
                            <p><span className="font-medium">PIN:</span> {n.exam.pincode}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(n.status)}`}>
                            {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                          </span>
                          {n.status === 'completed' && n.student && (
                            <div className="text-sm">
                              <span className="font-medium">📞 Contact:</span> {n.student.mobile ? n.student.mobile : 'Fetching...'}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <small className="text-gray-500">{new Date(n.created_at).toLocaleString()}</small>
                          <button
                            onClick={() => deleteNotification(n.id, n.student?.name || 'Student', n.exam?.name || 'Exam')}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                            title="Delete notification"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {n.status === 'pending' && (
                          <>
                            <button
                              onClick={() => respond(n.id, 'accepted')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                            >
                              ✅ Accept Request
                            </button>
                            <button
                              onClick={() => respond(n.id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                            >
                              ❌ Decline Request
                            </button>
                          </>
                        )}
                        {n.status === 'accepted' && (
                          <>
                            <button
                              onClick={() => respond(n.id, 'completed')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                              ✅ Mark as Completed
                            </button>
                            <button
                              onClick={() => cancelAssistance(n.id, n.student?.name || 'Student')}
                              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                            >
                              🚫 Cancel Assistance
                            </button>
                          </>
                        )}
                        {n.status === 'completed' && (
                          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                            ✅ Assistance Completed
                          </span>
                        )}
                        {n.status === 'rejected' && (
                          <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                            ❌ Request Declined
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
