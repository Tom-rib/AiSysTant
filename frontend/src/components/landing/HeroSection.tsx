import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function HeroSection() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100')
          entry.target.classList.remove('opacity-0')
        }
      },
      { threshold: 0.1 }
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden opacity-0 transition-opacity duration-1000"
    >
      {/* Animated gradient background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        {/* Logo & Badge */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-cyan-400 font-semibold text-sm tracking-widest mb-4">AISYSTANT</p>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-center mb-6 leading-tight animate-slide-up max-w-4xl">
          Gérez vos serveurs <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">en langage naturel</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-300 text-center mb-12 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Tapez en français naturel, AiSystant exécute vos commandes de manière sécurisée sur vos serveurs. Plus besoin d'appeler le cousin Geek.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            Se Connecter
          </button>
          <button
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="px-8 py-3 bg-white/10 backdrop-blur border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            Découvrir Plus
          </button>
        </div>

        {/* Stats/Features preview */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-16 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div>
            <p className="text-3xl font-bold text-cyan-400">1M+</p>
            <p className="text-gray-400 text-sm mt-2">Commandes exécutées</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-cyan-400">24/7</p>
            <p className="text-gray-400 text-sm mt-2">Support IA</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-cyan-400">99.9%</p>
            <p className="text-gray-400 text-sm mt-2">Uptime</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
