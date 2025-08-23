import React, { useEffect, useRef } from 'react'
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

export default function About(){
  const heroRef = useRef(null)
  const storyRef = useRef(null)
  const valuesRef = useRef(null)
  const teamRef = useRef(null)
  const impactRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Hero section animation
    const heroTl = gsap.timeline()
    heroTl.fromTo(heroRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    )

    // Story section animation
    const storyTl = gsap.timeline({
      scrollTrigger: {
        trigger: storyRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    storyTl.fromTo(storyRef.current.querySelectorAll('.story-content'), 
      { opacity: 0, x: -60 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.8, 
        ease: "power2.out",
        stagger: 0.3
      }
    )

    // Values section animation
    const valuesTl = gsap.timeline({
      scrollTrigger: {
        trigger: valuesRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    valuesTl.fromTo(valuesRef.current.querySelectorAll('.value-card'), 
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

    // Team section animation
    const teamTl = gsap.timeline({
      scrollTrigger: {
        trigger: teamRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    teamTl.fromTo(teamRef.current.querySelectorAll('.team-card'), 
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

    // Impact section animation
    const impactTl = gsap.timeline({
      scrollTrigger: {
        trigger: impactRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    
    impactTl.fromTo(impactRef.current.querySelectorAll('.impact-item'), 
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

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const values = [
    {
      icon: "🎯",
      title: "Our Mission",
      description: "Breaking down barriers and creating equal opportunities for all students to succeed in their academic pursuits"
    },
    {
      icon: "♿",
      title: "Accessibility First",
      description: "Designed with inclusive design principles to serve students with diverse needs and abilities"
    },
    {
      icon: "🛡️",
      title: "Trust & Security",
      description: "Comprehensive verification processes ensure safe, reliable connections between students and writers"
    },
    {
      icon: "🌍",
      title: "Global Impact",
      description: "Supporting students worldwide with location-based matching and verified assistance"
    }
  ]

  // Background images for the About page
  const backgroundImages = [
    {
      url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "About Hand2Write",
      subtitle: "The first-of-its-kind platform dedicated to connecting students with disabilities to verified, skilled writers for academic assistance."
    },
    {
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2032&q=80",
      title: "Our Mission",
      subtitle: "Breaking down barriers and creating equal opportunities for all students to succeed in their academic pursuits."
    },
    {
      url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Accessibility First",
      subtitle: "Designed with inclusive design principles to serve students with diverse needs and abilities."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section with Image Carousel Background */}
      <section className="relative" ref={heroRef}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="about-hero-swiper"
        >
          {backgroundImages.map((image, index) => (
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
                  <div className="text-center">
                    <div className="mb-8">
                      <div className="inline-block p-6 sm:p-8 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
                        <span className="text-6xl sm:text-8xl">📚</span>
                      </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight">
                      {image.title}
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
                      {image.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Our Story Section */}
      <section className="py-12 sm:py-16 lg:py-20" ref={storyRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="story-content">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-gray-800">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Hand2Write was born from a simple yet powerful observation: every student deserves equal access to education, regardless of their physical challenges or disabilities. Our founder, witnessing the struggles of students with disabilities in academic settings, recognized the need for a dedicated platform that could bridge the gap between students and qualified assistance.
                </p>
                <p>
                  What started as a local initiative has grown into a comprehensive platform serving students across multiple cities. We've built a community of verified writers who are not just skilled professionals, but compassionate individuals committed to making education accessible for everyone.
                </p>
                <p>
                  Today, Hand2Write stands as a testament to the power of technology in creating inclusive educational opportunities. We continue to innovate and expand our services, always keeping our core mission at heart: breaking down barriers and building futures.
                </p>
              </div>
            </div>
            <div className="story-content text-center">
              <div className="relative">
                <img 
                  src="/img/2.png" 
                  alt="Our Story" 
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-blue-600/10 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50" ref={valuesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
              Our Values
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do at Hand2Write
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <div key={index} className="value-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 sm:p-8 text-center">
                <div className="text-5xl sm:text-6xl mb-6">{value.icon}</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20" ref={teamRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
              Meet Our Team
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated professionals committed to making education accessible for everyone
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="team-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">J</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">John Smith</h3>
              <p className="text-blue-600 font-semibold mb-4">Founder & CEO</p>
              <p className="text-gray-600 leading-relaxed">
                Passionate about creating inclusive educational opportunities and breaking down barriers for students with disabilities.
              </p>
            </div>
            
            <div className="team-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">S</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">Sarah Johnson</h3>
              <p className="text-blue-600 font-semibold mb-4">Head of Operations</p>
              <p className="text-gray-600 leading-relaxed">
                Ensures smooth platform operations and maintains the highest standards of service quality and user experience.
              </p>
            </div>
            
            <div className="team-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">M</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">Michael Chen</h3>
              <p className="text-blue-600 font-semibold mb-4">Lead Developer</p>
              <p className="text-gray-600 leading-relaxed">
                Builds and maintains our secure, accessible platform with cutting-edge technology and user-friendly design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white" ref={impactRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">
            Our Impact
          </h2>
          <p className="text-lg sm:text-xl mb-12 sm:mb-16 max-w-3xl mx-auto opacity-90">
            Since our launch, we've helped hundreds of students achieve their academic goals and created meaningful opportunities for writers.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="impact-item p-6">
              <div className="text-4xl sm:text-5xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Students Helped</div>
            </div>
            <div className="impact-item p-6">
              <div className="text-4xl sm:text-5xl font-bold mb-2">200+</div>
              <div className="text-lg opacity-90">Verified Writers</div>
            </div>
            <div className="impact-item p-6">
              <div className="text-4xl sm:text-5xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Cities Covered</div>
            </div>
            <div className="impact-item p-6">
              <div className="text-4xl sm:text-5xl font-bold mb-2">98%</div>
              <div className="text-lg opacity-90">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20" ref={ctaRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="cta-content text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-gray-800">
            Get in Touch
          </h2>
          <p className="cta-content text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto">
            Have questions about our platform or want to learn more about how we can help? We'd love to hear from you.
          </p>
          <div className="cta-content flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Contact Us
            </a>
            <a 
              href="/register" 
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              Join Our Platform
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
