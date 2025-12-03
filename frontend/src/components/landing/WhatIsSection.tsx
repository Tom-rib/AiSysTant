import { useEffect, useRef } from 'react'

export default function WhatIsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

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

    if (textRef.current) observer.observe(textRef.current)
    if (imageRef.current) observer.observe(imageRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="w-full py-20 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Column */}
          <div
            ref={textRef}
            className="opacity-0 translate-y-10 transition-all duration-700 delay-100"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Qu'est-ce qu'AiSystant ?
            </h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="text-lg">
                AiSystant est une plateforme web innovante qui révolutionne la gestion d'infrastructure. Plutôt que de retenir des centaines de commandes Linux complexes, parlez simplement à notre IA Claude qui comprendra vos demandes et les exécutera de manière sécurisée sur vos serveurs.
              </p>

              <p className="text-lg">
                Destinée aux administrateurs système, aux PMEs sans département IT, et aux développeurs, AiSystant rend l'administration serveur accessible à tous.
              </p>

              <div className="pt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Interface simple et intuitive</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Exécution sécurisée des commandes SSH</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Support multi-serveurs avec audit complet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Column */}
          <div
            ref={imageRef}
            className="opacity-0 translate-y-10 transition-all duration-700 delay-200"
          >
            <div className="relative h-96 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              {/* Simulated terminal interface */}
              <div className="absolute inset-0 p-6 flex flex-col bg-slate-900 rounded-2xl">
                {/* Terminal header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-500 text-sm ml-4">AiSystant Terminal</span>
                </div>

                {/* Terminal content */}
                <div className="flex-1 font-mono text-sm text-cyan-400 overflow-hidden">
                  <div className="space-y-2">
                    <div>$ <span className="text-white">Redémarre nginx sur web-01</span></div>
                    <div className="text-green-400">✓ Claude IA valide la commande</div>
                    <div className="text-green-400">✓ Connecté à web-01 via SSH</div>
                    <div className="text-gray-400">sudo systemctl restart nginx</div>
                    <div className="text-green-400">✓ Commande exécutée avec succès</div>
                    <div className="pt-2 text-cyan-300">Résultat affichée en temps réel...</div>
                    <div className="text-cyan-400 animate-pulse">▋</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
