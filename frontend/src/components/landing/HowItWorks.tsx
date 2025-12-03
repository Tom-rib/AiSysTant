import { useEffect, useRef } from 'react'

interface StepProps {
  number: number
  title: string
  description: string
  delay: string
}

function StepCard({ number, title, description, delay }: StepProps) {
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
      <div className="relative">
        {/* Step number circle */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-bold text-2xl mb-6">
          {number}
        </div>

        {/* Card content */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-lg">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section className="w-full py-20 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Comment ça fonctionne
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Un processus simple en 4 étapes pour exécuter vos commandes en toute confiance
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StepCard
            number={1}
            title="Tapez votre demande"
            description="Vous tapez une commande en français naturel, comme 'Redémarre nginx sur web-01'"
            delay="delay-100"
          />

          <StepCard
            number={2}
            title="Claude AI valide"
            description="Notre IA Claude analyse votre demande et valide la sécurité avant d'exécuter"
            delay="delay-200"
          />

          <StepCard
            number={3}
            title="Exécution SSH"
            description="Le backend exécute la commande de manière atomique via SSH chiffré sur vos serveurs"
            delay="delay-300"
          />

          <StepCard
            number={4}
            title="Résultat en temps réel"
            description="Le résultat s'affiche instantanément dans le chat avec logs d'audit complets"
            delay="delay-400"
          />
        </div>

        {/* Process Flow Diagram */}
        <div className="mt-20 pt-20 border-t border-slate-200">
          <div className="hidden lg:block">
            {/* Desktop Flow */}
            <div className="flex items-center justify-between relative">
              {/* Step 1 */}
              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 border-2 border-cyan-400 mb-4">
                  <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-900">Chat</p>
              </div>

              {/* Arrow */}
              <div className="flex-1 flex justify-center">
                <svg className="w-12 h-12 text-cyan-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 border-2 border-cyan-400 mb-4">
                  <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-900">Validation</p>
              </div>

              {/* Arrow */}
              <div className="flex-1 flex justify-center">
                <svg className="w-12 h-12 text-cyan-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 border-2 border-cyan-400 mb-4">
                  <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-900">Exécution</p>
              </div>

              {/* Arrow */}
              <div className="flex-1 flex justify-center">
                <svg className="w-12 h-12 text-cyan-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Step 4 */}
              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 border-2 border-cyan-400 mb-4">
                  <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-900">Résultat</p>
              </div>
            </div>
          </div>

          {/* Mobile Flow */}
          <div className="lg:hidden space-y-8">
            {[
              { icon: '💬', title: 'Chat', desc: 'Tapez votre demande' },
              { icon: '✓', title: 'Validation', desc: 'IA vérifie la sécurité' },
              { icon: '⚡', title: 'Exécution', desc: 'SSH exécute la commande' },
              { icon: '📊', title: 'Résultat', desc: 'Affichage en direct' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{step.icon}</div>
                <div>
                  <p className="font-semibold text-slate-900">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
