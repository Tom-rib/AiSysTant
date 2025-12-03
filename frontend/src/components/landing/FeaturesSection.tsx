import { useEffect, useRef } from 'react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  delay: string
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

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

    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={cardRef}
      className={`opacity-0 translate-y-10 transition-all duration-700 ${delay}`}
    >
      <div className="h-full bg-white rounded-xl p-8 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <section id="features" className="w-full py-20 sm:py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Fonctionnalités Principales
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour gérer vos serveurs efficacement
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
              </svg>
            }
            title="Chat IA"
            description="Comprenez les commandes en français naturel sans être expert Linux"
            delay="delay-100"
          />

          <FeatureCard
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19h6m0 0v2m0-2v-2m0 0H9m6 0h4M5 9h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" />
              </svg>
            }
            title="Gestion SSH"
            description="Connectez vos serveurs et gérez plusieurs machines simultanément"
            delay="delay-200"
          />

          <FeatureCard
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="Monitoring"
            description="Surveillez CPU, RAM, Disk et alertes en direct sur tous vos serveurs"
            delay="delay-300"
          />

          <FeatureCard
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            title="Sécurisé"
            description="Authentification JWT, chiffrement SSH, audit logs complets"
            delay="delay-400"
          />
        </div>

        {/* Additional benefit cards */}
        <div className="mt-20 pt-20 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-500 mb-2">100%</div>
              <p className="text-gray-600">Commandes validées avant exécution</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-500 mb-2">Zero</div>
              <p className="text-gray-600">Dépendance à des outils externes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-500 mb-2">∞</div>
              <p className="text-gray-600">Scalabilité illimitée</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
