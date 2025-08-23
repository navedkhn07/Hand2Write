import React, {useEffect, useState, useRef} from 'react'
import { supabase } from '../supabaseClient'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function StudentProfile(){
  // Animation section refs
  const heroRef = useRef(null)
  const tabsRef = useRef(null)
  const profileRef = useRef(null)
  const examsRef = useRef(null)
  const writersRef = useRef(null)
  const notificationsRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [exam, setExam] = useState({date:'', name:'', qualification:'', center:'', pincode:''})
  const [writers, setWriters] = useState([])
  const [currentExamId, setCurrentExamId] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [pendingRequests, setPendingRequests] = useState(new Set())
  const [allExams, setAllExams] = useState([])
  const [activeTab, setActiveTab] = useState('profile')
  const [selectedNotifications, setSelectedNotifications] = useState(new Set())

  useEffect(()=>{ 
    fetchProfile() 
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

    // Exams section animation
    if (examsRef.current) {
      const examsTl = gsap.timeline({
        scrollTrigger: {
          trigger: examsRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      })
      examsTl.fromTo(examsRef.current.querySelectorAll('.exam-content'),
        { opacity: 0, y: 50, x: -30 },
        { opacity: 1, y: 0, x: 0, duration: 0.7, ease: 'power2.out', stagger: 0.15 }
      )
    }

    // Writers section animation
    if (writersRef.current) {
      const writersTl = gsap.timeline({
        scrollTrigger: {
          trigger: writersRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      })
      writersTl.fromTo(writersRef.current.querySelectorAll('.writer-card'),
        { opacity: 0, y: 60, rotationY: 15 },
        { opacity: 1, y: 0, rotationY: 0, duration: 0.8, ease: 'power2.out', stagger: 0.2 }
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

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
    // Refresh after creating triggers to ensure proper positions
    // Defer refresh to next tick so DOM is settled
    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 0)
  }, [profile, activeTab, allExams.length, writers.length, notifications.length])

  async function fetchProfile(){
    const u = (await supabase.auth.getUser()).data.user
    if(!u) return
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).single()
    setProfile(data)
    // fetch all exams for this student
    try {
      let { data: exams, error: examError } = await supabase
        .from('exam_info')
        .select('*')
        .eq('user_id', data.id)
        .order('date', { ascending: false })

      if (examError) {
        console.warn('Ordering by date failed, trying created_at desc. Error:', examError?.message || examError)
        const fallback = await supabase
          .from('exam_info')
          .select('*')
          .eq('user_id', data.id)
          .order('created_at', { ascending: false })
        exams = fallback.data || []
      }

      if (exams && exams.length) {
        setAllExams(exams)
        setCurrentExamId(exams[0].id) // Set most recent as current
      } else {
        setAllExams([])
        setCurrentExamId(null)
      }
    } catch (err) {
      console.error('Error fetching exams:', err)
      setAllExams([])
      setCurrentExamId(null)
    }
  }

  async function subscribeNotifications(){
    // Clean up any existing subscription
    supabase.removeAllChannels()
    
    // subscribe to notifications related to current student
    supabase.channel('student-notifications')
      .on('postgres_changes', {
        event:'*', 
        schema:'public', 
        table:'notifications'
      }, payload=>{
        console.log('Student notification change:', payload)
        // Add a small delay to ensure the change is committed
        setTimeout(() => {
        fetchMyNotifications()
        }, 100)
      }).subscribe()
    
    // initial fetch
    fetchMyNotifications()
  }

  async function fetchMyNotifications(){
    try {
      const u = (await supabase.auth.getUser()).data.user
      if(!u) return
      
      // Use current profile or fetch it
      let currentProfile = profile
      if(!currentProfile){
      const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single()
        currentProfile = p
      if(p) setProfile(p)
      }
      
      if(!currentProfile) return
      
      const { data, error } = await supabase.from('notifications').select('*').eq('student_id', currentProfile.id).order('created_at', {ascending:false})
      if(error) {
        console.error('Error fetching notifications:', error)
        return
      }
      
      if(!data || data.length === 0){ 
        setNotifications([])
        return 
      }
      
      // Enrich notifications with writer and exam details
      const enriched = await Promise.all(data.map(async n=>{
        let writer = null
        let exam = null
        
        // Fetch writer details
        if(n.writer_id){
          const { data: writerData } = await supabase.from('profiles').select('name, mobile, email').eq('id', n.writer_id).single()
          writer = writerData || null
        }
        
        // Fetch exam details
        if(n.exam_id){
          const { data: examData } = await supabase.from('exam_info').select('*').eq('id', n.exam_id).single()
          exam = examData || null
        }
        
        return {...n, writer, exam}
      }))
      
      setNotifications(enriched || [])
      
      // Update pending requests set - only for current exam
      const pending = new Set()
      enriched.forEach(n => {
        if(n.status === 'pending' && n.exam_id === currentExamId) {
          pending.add(n.writer_id)
        }
      })
      setPendingRequests(pending)
      
    } catch (error) {
      console.error('Error in fetchMyNotifications:', error)
    }
  }

  const addExam = async (e) => {
    e.preventDefault()
    if(!profile) return
    const { data, error } = await supabase.from('exam_info').insert([{
      user_id: profile.id,
      date: exam.date,
      name: exam.name,
      qualification: exam.qualification,
      center: exam.center,
      pincode: exam.pincode,
      status: 'open'
    }]).select().single()
    if(error){ alert('Error adding exam: ' + error.message); return }
    alert('Exam added')
    setCurrentExamId(data.id)
    // fetch nearby writers by matching pincode and user_type writer, exclude self
    await findQualifiedWriters(exam.pincode, exam.name)
    
    // Refresh notifications to update pending requests state
    fetchMyNotifications()
  }

  const findQualifiedWriters = async (pincode, examName) => {
    try {
      // Step 1: Get all writers in the same pincode
      const { data: allWriters, error: wErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('pincode', pincode)
        .eq('user_type', 'writer')
        .neq('id', profile.id)
      
      if(wErr){ 
        console.error('Writers fetch error', wErr)
        setWriters([])
        return 
      }

      if(!allWriters || allWriters.length === 0) {
        setWriters([])
        return
      }

      // Step 2: Find writers who have successfully completed assistance for the same exam type
      const { data: successfulAssistance, error: notifErr } = await supabase
        .from('notifications')
        .select(`
          writer_id,
          exam_info!inner(name)
        `)
        .eq('status', 'completed')
        .eq('exam_info.name', examName)

      if(notifErr) {
        console.error('Error fetching successful assistance:', notifErr)
        // Fallback to showing all writers if query fails
        setWriters(allWriters)
        return
      }

      // Step 3: Prioritize writers with experience in this exam type
      const experiencedWriterIds = new Set(
        (successfulAssistance || []).map(item => item.writer_id)
      )

      // Separate experienced and new writers
      const experiencedWriters = allWriters.filter(w => experiencedWriterIds.has(w.id))
      const newWriters = allWriters.filter(w => !experiencedWriterIds.has(w.id))

      // Combine with experienced writers first
      const sortedWriters = [...experiencedWriters, ...newWriters]

      // Add experience indicator to writers
      const enrichedWriters = sortedWriters.map(writer => ({
        ...writer,
        hasExperience: experiencedWriterIds.has(writer.id)
      }))

      setWriters(enrichedWriters)
      
      if(experiencedWriters.length > 0) {
        console.log(`Found ${experiencedWriters.length} writers with experience in ${examName}`)
      }

    } catch (error) {
      console.error('Error in findQualifiedWriters:', error)
      // Fallback to basic pincode matching
      const { data: fallbackWriters } = await supabase
        .from('profiles')
        .select('*')
        .eq('pincode', pincode)
        .eq('user_type', 'writer')
        .neq('id', profile.id)
      setWriters(fallbackWriters || [])
    }
  }

  const selectWriter = async (writerId, writerName) => {
    if(!profile){ alert('Profile not loaded'); return }
    if(!currentExamId){ alert('Please add an exam first'); return }
    
    // Check if there's already a pending request to this writer
    if(pendingRequests.has(writerId)) {
      alert('You already have a pending request to this writer. Please wait for their response.')
      return
    }
    
    const { data, error } = await supabase.from('notifications').insert([{
      student_id: profile.id,
      writer_id: writerId,
      exam_id: currentExamId,
      status: 'pending'
    }]).select().single()
    if(error){ alert('Error sending request: ' + error.message); return }
    
    // Add to pending requests immediately for UI responsiveness
    setPendingRequests(prev => new Set([...prev, writerId]))
    
    alert('Request sent successfully to ' + writerName + '. Please wait for their response.')
    // refresh notifications
    fetchMyNotifications()
  }

  const cancelRequest = async (notificationId, writerName) => {
    if(!confirm(`Are you sure you want to cancel your request to ${writerName}?`)) return
    
    const { error } = await supabase.from('notifications').update({status: 'cancelled'}).eq('id', notificationId)
    if(error) {
      alert('Error cancelling request: ' + error.message)
      return
    }
    
    alert('Request cancelled successfully. You can request assistance from other writers.')
    fetchMyNotifications()
  }

  const deleteExam = async (examId, examName) => {
    if(!confirm(`Are you sure you want to delete the exam "${examName}"? This will also delete all related notifications.`)) return
    
    try {
      // Delete related notifications first
      const { error: notifError } = await supabase.from('notifications').delete().eq('exam_id', examId)
      if(notifError) throw notifError
      
      // Delete the exam
      const { error: examError } = await supabase.from('exam_info').delete().eq('id', examId)
      if(examError) throw examError
      
      alert('Exam deleted successfully')
      
      // Reset current exam if it was the deleted one
      if(currentExamId === examId) {
        setCurrentExamId(null)
        setWriters([])
      }
      
      // Refresh exam list and notifications
      fetchProfile()
      fetchMyNotifications()
    } catch (error) {
      alert('Error deleting exam: ' + error.message)
    }
  }

  const deleteNotification = async (notificationId, writerName, examName) => {
    if(!confirm(`Are you sure you want to delete this notification from ${writerName} for ${examName}?`)) return
    
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

  // Helper functions for notification styling
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
              <span className="text-3xl">🎓</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.name}!</h1>
            <p className="text-blue-100 text-lg">Manage your exams and connect with qualified writers</p>
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
            onClick={() => setActiveTab('exams')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'exams'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            📝 Exams
          </button>
          <button
            onClick={() => setActiveTab('writers')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'writers'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            ✍️ Writers
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
                  <div className="profile-content flex items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 mr-3">🎓</span>
                    <div>
                      <p className="text-sm text-gray-500">Account Type</p>
                      <p className="font-medium capitalize">{profile.user_type === 'disabled' ? 'Student' : profile.user_type}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div ref={examsRef} className="space-y-6">
            {/* Add New Exam Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">➕</span>
                Add New Examination
              </h2>
              <form onSubmit={addExam} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📅 Exam Date</label>
                    <input
                      required
                      type="date"
                      value={exam.date}
                      onChange={e => setExam({...exam, date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📝 Exam Name</label>
                    <input
                      required
                      value={exam.name}
                      onChange={e => setExam({...exam, name: e.target.value})}
                      placeholder="e.g., UPSC, CAT, NEET"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🎓 Qualification Required</label>
                    <input
                      required
                      value={exam.qualification}
                      onChange={e => setExam({...exam, qualification: e.target.value})}
                      placeholder="e.g., 12th Pass, Graduation"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🏢 Exam Center</label>
                    <input
                      required
                      value={exam.center}
                      onChange={e => setExam({...exam, center: e.target.value})}
                      placeholder="Center name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📮 PIN Code</label>
                    <input
                      required
                      value={exam.pincode}
                      onChange={e => setExam({...exam, pincode: e.target.value})}
                      placeholder="6-digit PIN code"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  ➕ Add Exam
                </button>
              </form>
            </div>

            {/* Existing Exams */}
              {allExams.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="text-3xl mr-3">📚</span>
                  Your Examinations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allExams.map(examItem => (
                    <div
                      key={examItem.id}
                      className={`exam-content p-6 rounded-xl border-2 transition-all duration-200 ${
                        examItem.id === currentExamId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {examItem.name}
                            {examItem.id === currentExamId && (
                              <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                Current
                              </span>
                            )}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">📅 Date:</span> {examItem.date}</p>
                            <p><span className="font-medium">🏢 Center:</span> {examItem.center}</p>
                            <p><span className="font-medium">📮 PIN:</span> {examItem.pincode}</p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {examItem.id !== currentExamId && (
                            <button
                              onClick={() => setCurrentExamId(examItem.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                              Select
                            </button>
                          )}
                          <button
                            onClick={() => deleteExam(examItem.id, examItem.name)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Writers Tab */}
        {activeTab === 'writers' && (
          <div ref={writersRef} className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">✍️</span>
              Available Writers Nearby
            </h2>
            
            {writers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg">No writers found for this PIN code yet.</p>
                <p className="text-gray-500">Add an exam with your PIN code to search for nearby writers.</p>
              </div>
            )}
            
            {writers.length > 0 && exam.name && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  Found <span className="font-bold">{writers.length}</span> writer(s) in PIN <span className="font-bold">{exam.pincode}</span>
                  {writers.filter(w => w.hasExperience).length > 0 && (
                    <span className="ml-2">
                      (<span className="font-bold">{writers.filter(w => w.hasExperience).length}</span> with <span className="font-bold">{exam.name}</span> experience)
                    </span>
                  )}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {writers.map(w => {
                const hasPendingRequest = pendingRequests.has(w.id)
                const notification = notifications.find(n => n.writer_id === w.id && n.exam_id === currentExamId)
                const anyNotification = notifications.find(n => n.writer_id === w.id)
                
                return (
                  <div
                    key={w.id}
                    className={`writer-card p-6 rounded-xl border-2 transition-all duration-200 ${
                      w.hasExperience ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="text-lg font-bold text-gray-800 mr-3">{w.name}</h3>
                          {w.hasExperience && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                              ⭐ Experienced with {exam.name}
                            </span>
                          )}
                          {!w.hasExperience && anyNotification && anyNotification.status === 'completed' && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                              ✓ Reliable Writer
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-gray-600">
                          <p>📧 {w.email}</p>
                          <p>📍 {w.district} • PIN: {w.pincode}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {notification ? (
                          <>
                            {notification.status === 'pending' && (
                              <>
                                <button className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium" disabled>
                                  ⏳ Request Pending...
                                </button>
                                <button
                                  onClick={() => cancelRequest(notification.id, w.name)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                                >
                                  Cancel Request
                                </button>
                              </>
                            )}
                            {notification.status === 'accepted' && (
                              <>
                                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium text-center">
                                  ✅ Accepted
                                </span>
                                <button
                                  onClick={() => cancelRequest(notification.id, w.name)}
                                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                                >
                                  Cancel Request
                                </button>
                              </>
                            )}
                            {notification.status === 'rejected' && (
                              <button
                                onClick={() => selectWriter(w.id, w.name)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                              >
                                Request Again
                              </button>
                            )}
                            {notification.status === 'completed' && (
                              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium text-center">
                                ✅ Completed
                              </span>
                            )}
                            {notification.status === 'cancelled' && (
                              <>
                                <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium text-center">
                                  ❌ Cancelled
                                </span>
                                <button
                                  onClick={() => selectWriter(w.id, w.name)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                                >
                                  Request Again
                                </button>
                              </>
                            )}
                          </>
                        ) : anyNotification && anyNotification.status === 'completed' ? (
                          <div className="text-center">
                            <button
                              onClick={() => selectWriter(w.id, w.name)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                            >
                              Request Assistance
                            </button>
                            <p className="text-green-600 text-xs mt-1">✓ Completed past assistance</p>
                          </div>
                        ) : !hasPendingRequest ? (
                          <button
                            onClick={() => selectWriter(w.id, w.name)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                          >
                            Request Assistance
                          </button>
                        ) : (
                          <button className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium" disabled>
                            ⏳ Request Pending...
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div ref={notificationsRef} className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-3xl mr-3">🔔</span>
                Notifications
              </h2>
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
            
            {notifications.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 text-lg">No notifications yet.</p>
                <p className="text-gray-500">You'll see updates here when writers respond to your requests.</p>
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
                  {n.writer && (
                    <div className="mb-3">
                      <p className="text-gray-800">
                        <span className="font-bold">{n.writer.name}</span> has {getStatusText(n.status)} your assistance for an exam:
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
                      {n.status === 'completed' && n.writer && (
                        <div className="text-sm">
                          <span className="font-medium">📞 Contact:</span> {n.writer.mobile ? n.writer.mobile : 'Fetching...'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <small className="text-gray-500">{new Date(n.created_at).toLocaleString()}</small>
                      <button
                        onClick={() => deleteNotification(n.id, n.writer?.name || 'Writer', n.exam?.name || 'Exam')}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                        title="Delete notification"
                      >
                        🗑️ Delete
                      </button>
                    </div>
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
