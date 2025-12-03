import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface PricingTier {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  description: string
  badge?: string
  popular?: boolean
  features: string[]
  cta: string
  ctaLink: string
}

const pricingTiers: PricingTier[] = [
  {
    name: 'FREE',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Parfait pour les développeurs solo',
    features: [
      '1 serveur',
      '20 requêtes/jour',
      '1 utilisateur',
      'Support email 48h',
      'Accès Chat IA',
      'Logs basiques',
    ],
    cta: 'Essayer Gratuitement',
    ctaLink: '/register',
  },
  {
    name: 'STARTER',
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: 'Idéal pour les petits projets',
    features: [
      '5 serveurs',
      '200 requêtes/jour',
      '1 utilisateur',
      'Support email 24h',
      'Chat IA + Monitoring',
      'Logs détaillés',
      'Webhooks de base',
    ],
    cta: 'Commencer',
    ctaLink: '/checkout?plan=starter',
  },
  {
    name: 'PRO',
    monthlyPrice: 79,
    yearlyPrice: 790,
    description: 'Pour les équipes DevOps',
    badge: 'POPULAIRE',
    popular: true,
    features: [
      '50 serveurs',
      '2,000 requêtes/jour',
      '5 utilisateurs',
      'Support Slack + Email 4h',
      'Chat IA + Monitoring avancé',
      'Audit Logs complets',
      'API + Webhooks',
      'SSO de base',
    ],
    cta: 'Commencer',
    ctaLink: '/checkout?plan=pro',
  },
  {
    name: 'ENTERPRISE',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    description: 'Pour les grandes organisations',
    features: [
      '100+ serveurs',
      'Requêtes illimitées',
      '20+ utilisateurs',
      'Support phone + Slack 1h',
      'Chat IA + Full Monitoring',
      'Audit Logs + Analytics',
      'API complète + Webhooks',
      'SSO/SAML + Custom Branding',
    ],
    cta: 'Contacter Ventes',
    ctaLink: '/contact?plan=enterprise',
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const [isYearly, setIsYearly] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: 'Puis-je changer de plan à tout moment?',
      answer: 'Oui! Vous pouvez upgrader ou downgrader votre plan quand vous le souhaitez. Les changements sont appliqués au prochain cycle de facturation.',
    },
    {
      question: 'Avez-vous une garantie de remboursement?',
      answer: 'Oui, nous proposons une garantie de remboursement de 30 jours si vous n\'êtes pas satisfait.',
    },
    {
      question: 'Que se passe-t-il si je dépasse mes limites?',
      answer: 'Vous serez alerté avant d\'atteindre votre limite. Vous pouvez upgrader instantanément ou vos requêtes seront mises en attente jusqu\'au prochain cycle.',
    },
    {
      question: 'Offrez-vous des remises pour les contrats annuels?',
      answer: 'Oui! Les plans annuels vous font économiser environ 2 mois par rapport au paiement mensuel.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Tarification Simple & Transparente
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Pas de frais cachés. Annulez quand vous voulez. Facturez mensuellement ou annuellement.
          </p>

          {/* Monthly/Yearly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-lg font-semibold ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
              Mensuel
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-12 w-24 items-center rounded-full bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-cyan-400 shadow-lg transition-transform ${
                  isYearly ? 'translate-x-12' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-semibold ${isYearly ? 'text-white' : 'text-gray-400'}`}>
              Annuel
            </span>
            {isYearly && (
              <span className="ml-4 inline-block bg-cyan-400 text-slate-900 px-3 py-1 rounded-full text-sm font-semibold">
                ✨ Économisez 2 mois
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  tier.popular
                    ? 'lg:scale-105 border-2 border-cyan-400 shadow-2xl shadow-cyan-400/50'
                    : 'border border-slate-700 hover:border-slate-600'
                } bg-slate-800 hover:shadow-xl`}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute top-0 right-0 bg-cyan-400 text-slate-900 px-4 py-2 rounded-bl-xl font-bold text-sm">
                    {tier.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400 text-sm mb-6">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">
                      €{isYearly ? (tier.yearlyPrice / 12).toFixed(0) : tier.monthlyPrice}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {isYearly ? '/mois (annuel)' : '/mois'}
                    </span>
                    {isYearly && tier.yearlyPrice > 0 && (
                      <p className="text-sm text-cyan-400 mt-2">
                        €{tier.yearlyPrice}/an
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => navigate(tier.ctaLink)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 mb-8 ${
                      tier.popular
                        ? 'bg-cyan-400 text-slate-900 hover:brightness-110'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:brightness-110'
                    }`}
                  >
                    {tier.cta}
                  </button>

                  {/* Features */}
                  <div className="space-y-3">
                    {tier.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Comparaison Complète</h2>

          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">Fonctionnalités</th>
                  <th className="px-6 py-4 text-center text-gray-300">Free</th>
                  <th className="px-6 py-4 text-center text-gray-300">Starter</th>
                  <th className="px-6 py-4 text-center text-cyan-400 font-semibold">Pro</th>
                  <th className="px-6 py-4 text-center text-gray-300">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {[
                  { feature: 'Serveurs', free: '1', starter: '5', pro: '50', enterprise: '100+' },
                  { feature: 'Requêtes/jour', free: '20', starter: '200', pro: '2,000', enterprise: 'illimitées' },
                  { feature: 'Utilisateurs', free: '1', starter: '1', pro: '5', enterprise: '20+' },
                  { feature: 'Support', free: '48h email', starter: '24h email', pro: '4h Slack+Email', enterprise: '1h phone+Slack' },
                  { feature: 'Chat IA', free: '✓', starter: '✓', pro: '✓', enterprise: '✓' },
                  { feature: 'Monitoring', free: '✗', starter: 'basique', pro: 'avancé', enterprise: 'complet' },
                  { feature: 'API & Webhooks', free: '✗', starter: '✗', pro: '✓', enterprise: '✓' },
                  { feature: 'SSO/SAML', free: '✗', starter: '✗', pro: 'de base', enterprise: '✓' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 text-white font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-gray-400">{row.free}</td>
                    <td className="px-6 py-4 text-center text-gray-400">{row.starter}</td>
                    <td className="px-6 py-4 text-center text-cyan-400 font-semibold">{row.pro}</td>
                    <td className="px-6 py-4 text-center text-gray-400">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Questions Fréquentes</h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                >
                  <span className="text-white font-semibold text-lg">{faq.question}</span>
                  <svg
                    className={`w-6 h-6 text-cyan-400 transition-transform duration-300 ${
                      expandedFaq === idx ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {expandedFaq === idx && (
                  <div className="px-6 py-4 bg-slate-700/20 border-t border-slate-700">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Prêt à commencer?
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Rejoignez des milliers d'administrateurs système qui gèrent déjà leurs serveurs avec AiSystant
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:brightness-90 transition-all duration-300 hover:scale-105"
            >
              Essayer Gratuitement
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 bg-white/20 border-2 border-white text-white font-bold rounded-lg hover:bg-white/30 transition-all duration-300 hover:scale-105"
            >
              Contacter Ventes
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
