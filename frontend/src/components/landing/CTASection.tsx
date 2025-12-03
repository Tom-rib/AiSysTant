import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function CTASection() {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0')
          entry.target.classList.remove('opacity-0', 'translate-y-10')
        }
      },
      { threshold: 0.1 }
    )

    if (contentRef.current) observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 sm:py-32 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center opacity-0 translate-y-10 transition-all duration-700"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Prêt à révolutionner votre gestion d'infrastructure ?
        </h2>

        <p className="text-xl text-gray-300 mb-12 leading-relaxed">
          Rejoignez les administrateurs système qui ont déjà transformé leur workflow avec AiSystant. Plus de stress, plus de commandes complexes, juste du français naturel.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold rounded-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 text-lg"
          >
            Commencer Maintenant
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 text-white font-bold rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 text-lg"
          >
            Se Connecter
          </button>
        </div>

        {/* Additional links */}
        <p className="text-gray-400">
          <button
            onClick={() => {
              // Link to demo or documentation
              window.open('https://github.com', '_blank')
            }}
            className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline"
          >
            Voir la démonstration
          </button>
          {' '} • {' '}
          <button
            onClick={() => {
              window.open('https://github.com', '_blank')
            }}
            className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline"
          >
            Documentation
          </button>
        </p>

        {/* Trust badges */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-6">Approuvé par les professionnels</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-white">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sécurisé et certifié</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Support 24/7</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Essai gratuit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
