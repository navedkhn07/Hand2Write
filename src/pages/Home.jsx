import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function Home(){
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const statsRef = useRef(null)
  const ctaRef = useRef(null)
  const testimonialsRef = useRef(null)
  const copyrightRef = useRef(null)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Hero section animation
    const heroTl = gsap.timeline()
    heroTl.fromTo(heroRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    )

    // Features section animation
    const featuresTl = gsap.timeline({
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    featuresTl.fromTo(featuresRef.current.querySelectorAll('.feature-card'), 
      { opacity: 0, y: 60, scale: 0.8 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.8, 
        ease: "back.out(1.7)",
        stagger: 0.2
      }
    )

    // How It Works section animation
    const howItWorksTl = gsap.timeline({
      scrollTrigger: {
        trigger: howItWorksRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    howItWorksTl.fromTo(howItWorksRef.current.querySelectorAll('.step-card'), 
      { opacity: 0, x: -60, rotation: -5 },
      { 
        opacity: 1, 
        x: 0, 
        rotation: 0, 
        duration: 0.8, 
        ease: "power2.out",
        stagger: 0.3
      }
    )

    // Stats section animation
    const statsTl = gsap.timeline({
      scrollTrigger: {
        trigger: statsRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    statsTl.fromTo(statsRef.current.querySelectorAll('.stat-item'), 
      { opacity: 0, y: 40, scale: 0.5 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.6, 
        ease: "elastic.out(1, 0.3)",
        stagger: 0.15
      }
    )

    // CTA section animation
    const ctaTl = gsap.timeline({
      scrollTrigger: {
        trigger: ctaRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    ctaTl.fromTo(ctaRef.current.querySelectorAll('.cta-content'), 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: "power2.out",
        stagger: 0.2
      }
    )

    // Testimonials section animation
    const testimonialsTl = gsap.timeline({
      scrollTrigger: {
        trigger: testimonialsRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    testimonialsTl.fromTo(testimonialsRef.current.querySelectorAll('.testimonial-card'), 
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

    // Copyright section animation
    const copyrightTl = gsap.timeline({
      scrollTrigger: {
        trigger: copyrightRef.current,
        start: "top 90%",
        end: "bottom 10%",
        toggleActions: "play none none reverse"
      }
    })
    
    copyrightTl.fromTo(copyrightRef.current.querySelectorAll('.copyright-content'), 
      { opacity: 0, y: 20 },
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

  const features = [
    {
      icon: "🎯",
      title: "Verified Writers Only",
      description: "All writers go through comprehensive background checks and verification processes"
    },
    {
      icon: "📍",
      title: "Location-Based Matching",
      description: "Find writers near your exam location for convenient meetups and assistance"
    },
    {
      icon: "💬",
      title: "Direct Communication",
      description: "Connect with potential writers before booking to ensure the perfect match"
    },
    {
      icon: "🛡️",
      title: "Safe & Secure",
      description: "Your privacy and security are our top priorities with encrypted communications"
    }
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Profile",
      description: "Sign up as a student or writer with your preferences and requirements"
    },
    {
      step: "2", 
      title: "Find Your Match",
      description: "Browse verified writers or receive requests based on location and expertise"
    },
    {
      step: "3",
      title: "Connect & Communicate", 
      description: "Chat directly with potential matches to ensure the perfect fit"
    },
    {
      step: "4",
      title: "Confirm & Meet",
      description: "Book your session and meet at the exam location for assistance"
    }
  ]

  const stats = [
    { number: "500+", label: "Students Helped" },
    { number: "200+", label: "Verified Writers" },
    { number: "50+", label: "Cities Covered" },
    { number: "98%", label: "Success Rate" }
  ]

  // Image carousel data - Replace these placeholder URLs with your actual images
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      title: "Breaking Barriers, Building Futures",
      subtitle: "Hand2Write connects students with disabilities to verified, skilled writers for academic assistance. Every student deserves equal access to education."
    },
    {
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2032&q=80",
      title: "Empowering Education",
      subtitle: "Our platform ensures every student has access to quality academic support regardless of their challenges."
    },
    {
      url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Verified & Trusted Writers",
      subtitle: "Connect with qualified professionals who understand your needs and are committed to your success."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section with Image Carousel */}
      <section ref={heroRef} className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="hero-swiper"
        >
          {heroImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div 
                className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[75vh] flex items-center justify-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${image.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="text-center lg:text-left">
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight">
                        {image.title}
                      </h1>
                      <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-white/90 leading-relaxed">
                        {image.subtitle}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link 
                          to="/register" 
                          className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Get Started Today
                        </Link>
                        <Link 
                          to="/about" 
                          className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
                        >
                          Learn More
                        </Link>
                      </div>
                    </div>
                    <div className="hidden lg:flex justify-center">
                      <div className="w-64 h-64 sm:w-80 sm:h-80 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <div className="text-center">
                          <div className="text-6xl sm:text-8xl mb-4">✍️</div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Hand2Write</h3>
                          <p className="text-white/90 text-lg">Connecting Students & Writers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
              Why Choose Hand2Write?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is designed with accessibility, security, and convenience in mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="feature-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 sm:p-8">
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl mb-4">{feature.icon}</div>
                      <h5 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">{feature.title}</h5>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 text-center">
              <div className="relative">
                <img 
                  src="/img/1.png" 
                  alt="Why Choose Hand2Write" 
                  className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-blue-600/10 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Our simple 4-step process connects you with the perfect verified writer
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="step-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.step}
                </div>
                <h5 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">{step.title}</h5>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item p-6">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-semibold text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section ref={ctaRef} className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="cta-content text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">
            Ready to Get Started?
          </h2>
          <p className="cta-content text-lg sm:text-xl mb-8 sm:mb-10 max-w-3xl mx-auto">
            Join thousands of students and writers who are already using Hand2Write 
            to create equal opportunities in education.
          </p>
          <div className="cta-content flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Sign Up Now
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Already Have an Account?
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
              What Our Users Say
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from students and writers using our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="testimonial-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8">
              <div className="mb-4">
                <span className="text-yellow-400 text-2xl">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Hand2Write helped me find a reliable writer for my exams. The verification process gave me peace of mind."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Sarah M.</div>
                  <div className="text-gray-500 text-sm">Student</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8">
              <div className="mb-4">
                <span className="text-yellow-400 text-2xl">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "As a writer, I love helping students achieve their goals. The platform makes it easy to connect."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                  <div className="font-bold text-white">M</div>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Michael R.</div>
                  <div className="text-gray-500 text-sm">Writer</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8">
              <div className="mb-4">
                <span className="text-yellow-400 text-2xl">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "The location-based matching is fantastic. I found a writer just 10 minutes from my exam center."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">A</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Alex K.</div>
                  <div className="text-gray-500 text-sm">Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright Section */}
      <section ref={copyrightRef} className="py-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="copyright-content text-center md:text-left">
              <p className="text-gray-300">
                © 2024 Hand2Write. All rights reserved.
              </p>
            </div>
            <div className="copyright-content text-center md:text-right">
              <p className="text-gray-300">
                Making education accessible for everyone
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
