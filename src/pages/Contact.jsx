import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const heroRef = useRef(null)
  const formRef = useRef(null)
  const infoRef = useRef(null)
  const faqRef = useRef(null)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Hero section animation
    const heroTl = gsap.timeline()
    heroTl.fromTo(heroRef.current, 
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

    // Contact info section animation
    const infoTl = gsap.timeline({
      scrollTrigger: {
        trigger: infoRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    infoTl.fromTo(infoRef.current.querySelectorAll('.info-card'), 
      { opacity: 0, y: 50, rotationY: 15 },
      { 
        opacity: 1, 
        y: 0, 
        rotationY: 0, 
        duration: 0.8, 
        ease: "power2.out",
        stagger: 0.2
      }
    )

    // FAQ section animation
    const faqTl = gsap.timeline({
      scrollTrigger: {
        trigger: faqRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    faqTl.fromTo(faqRef.current.querySelectorAll('.faq-item'), 
      { opacity: 0, y: 40, x: -30 },
      { 
        opacity: 1, 
        y: 0, 
        x: 0, 
        duration: 0.6, 
        ease: "power2.out",
        stagger: 0.15
      }
    )

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const [form, setForm] = useState({
    name: '',
    email: '',
    userType: 'student',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you can add logic to send the contact form
    console.log('Contact form submitted:', form)
    alert('Thank you for your message! We will get back to you soon.')
    setForm({
      name: '',
      email: '',
      userType: 'student',
      subject: '',
      message: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section ref={heroRef} className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-block p-6 sm:p-8 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
              <span className="text-6xl sm:text-8xl">📞</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8">
            Get in Touch
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto opacity-90 leading-relaxed">
            Have questions about our platform? Need help with your account? 
            We're here to support you every step of the way.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section ref={formRef} className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="form-content bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 sm:p-12">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
                  Send us a Message
                </h2>
                <p className="text-gray-600 text-lg">
                  Fill out the form below and we'll get back to you within 24 hours
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="userType" className="block text-sm font-semibold text-gray-700 mb-2">
                      I am a <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      id="userType"
                      name="userType"
                      value={form.userType}
                      onChange={handleChange}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="writer">Writer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this about?"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section ref={infoRef} className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
              Other Ways to Reach Us
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Prefer to contact us through other channels? We're available through multiple platforms.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="info-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">📧</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Email Support</h3>
              <p className="text-gray-600 mb-4">
                Get detailed responses to your questions via email
              </p>
              <a 
                href="mailto:support@hand2write.com" 
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                support@hand2write.com
              </a>
            </div>
            
            <div className="info-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">💬</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Live Chat</h3>
              <p className="text-gray-600 mb-4">
                Chat with our support team in real-time during business hours
              </p>
              <button className="text-green-600 font-semibold hover:text-green-700 transition-colors" onClick={() => window.dispatchEvent(new Event('openChat'))}>
                Start Chat
              </button>
            </div>
            
            <div className="info-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Phone Support</h3>
              <p className="text-gray-600 mb-4">
                Speak directly with our support team for urgent matters
              </p>
              <a 
                href="tel:+1-800-HAND2WRITE" 
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                +1 (800) HAND2WRITE
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Find quick answers to common questions about our platform
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="faq-item bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                How does the verification process work for writers?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                All writers undergo a comprehensive background check, including identity verification, 
                educational credentials validation, and reference checks. We also conduct interviews 
                to ensure they understand the platform's mission and requirements.
              </p>
            </div>
            
            <div className="faq-item bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                What if I'm not satisfied with a writer's assistance?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We have a satisfaction guarantee policy. If you're not completely satisfied with 
                the assistance provided, we'll work with you to find a better match or provide 
                a refund according to our terms of service.
              </p>
            </div>
            
            <div className="faq-item bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                How do you ensure the privacy and security of user data?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We use industry-standard encryption protocols and follow strict data protection 
                regulations. All personal information is securely stored and never shared with 
                third parties without explicit consent.
              </p>
            </div>
            
            <div className="faq-item bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                Can I use the platform for multiple exams or assignments?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! You can use our platform for multiple academic needs. Each request is 
                handled separately, and you can work with different writers based on their 
                expertise and availability.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
