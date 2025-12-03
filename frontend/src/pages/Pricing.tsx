import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PricingPlan {
  id: string
  name: string
  price: number
  priceAnnual?: number
  description: string
  servers: string | number
  requests: string | number
  users: string | number
  support: string
  features: string[]
  cta: string
  ctaLink: string
  popular: boolean
  badge?: string
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'FREE',
    price: 0,
    description: 'Pour Développeurs Solo',
    servers: 1,
    requests: 20,
    users: 1,
    support: 'Email 48h',
    features: [
      '1 serveur',
      '20 requêtes/jour',
      '1 utilisateur',
      'Support email (48h)',
    ],
    cta: 'Essayer Gratuitement',
    ctaLink: '/',
    popular: false,
  },
  {
    id: 'starter',
    name: 'STARTER',
    price: 29,
    priceAnnual: 290,
    description: 'Pour Petits Projets',
    servers: 5,
    requests: 200,
    users: 1,
    support: 'Email 24h',
    features: [
      '5 serveurs',
      '200 requêtes/jour',
      '1 utilisateur',
      'Support email (24h)',
    ],
    cta: 'Commencer Maintenant',
    ctaLink: '/checkout?plan=starter',
    popular: false,
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 79,
    priceAnnual: 790,
    description: 'Meilleur Rapport Qualité',
    servers: 50,
    requests: 2000,
    users: 5,
    support: 'Slack + Email (4h)',
    features: [
      '50 serveurs',
      '2,000 requêtes/jour',
      '5 utilisateurs',
      'Support Slack + Email (4h)',
      'Accès API',
      'Audit Logs',
    ],
    cta: 'Commencer Maintenant',
    ctaLink: '/checkout?plan=pro',
    popular: true,
    badge: '⭐ POPULAIRE',
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: 199,
    priceAnnual: 1990,
    description: 'Personnalisé Pour Vous',
    servers: '100+',
    requests: 'Illimité',
    users: '20+',
    support: 'Phone + Slack (1h)',
    features: [
      '100+ serveurs',
      'Requêtes illimitées',
      '20+ utilisateurs',
      'Support phone + Slack (1h)',
      'SSO/SAML',
      'Audit Logs',
    ],
    cta: 'Contacter Ventes',
    ctaLink: '/contact?plan=enterprise',
    popular: false,
  },
]

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'Puis-je changer de plan?',
    answer:
      'Oui, vous pouvez changer de plan à tout moment. Les modifications prendront effet immédiatement et votre facturation sera ajustée proportionnellement.',
  },
  {
    id: 2,
    question: 'Que se passe-t-il si je dépasse mes limites?',
    answer:
      'Nous vous enverrons une alerte avant que vous n\'atteigniez vos limites. Vous pouvez alors mettre à niveau votre plan ou contacter notre support pour des options personnalisées.',
  },
  {
    id: 3,
    question: 'Avez-vous un essai gratuit?',
    answer:
      'Le plan FREE offre des capacités limitées mais gratuites et illimitées dans le temps. Commencez par ce plan pour explorer les fonctionnalités.',
  },
  {
    id: 4,
    question: 'Comment fonctionne la facturation?',
    answer:
      'Nous facturons mensuellement ou annuellement selon votre choix. Vous recevrez une facture par email chaque mois/an et pouvez télécharger vos relevés à tout moment.',
  },
  {
    id: 5,
    question: 'Puis-je obtenir une réduction annuelle?',
    answer:
      'Oui! Les plans annuels offrent environ 2 mois gratuits comparé à la facturation mensuelle. C\'est une économie de ~17%.',
  },
]

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const getPrice = (plan: PricingPlan) => {
    if (plan.id === 'free') return 0
    return isAnnual && plan.priceAnnual ? plan.priceAnnual : plan.price
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-400 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            Tarification Simple & Transparente
          </h1>
          <p className="text-xl text-gray-100 mb-8">
            Pas de frais cachés. Annulez quand vous voulez.
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            Contacter les Ventes
          </button>
        </div>
      </div>

      {/* Toggle Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center gap-6 mb-12">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                !isAnnual
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isAnnual
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              Annuel
            </button>
          </div>
          {isAnnual && (
            <p className="text-center text-cyan-400 font-semibold text-lg mb-8">
              ✨ Économisez 2 mois!
            </p>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30 lg:scale-105'
                    : 'bg-slate-800 border border-slate-700 hover:border-slate-600 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20'
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-cyan-500 text-slate-900 px-3 py-1 rounded-full text-sm font-bold">
                    {plan.badge}
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-cyan-400">
                    €{getPrice(plan)}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {plan.id !== 'free' && (isAnnual ? '/an' : '/mois')}
                  </span>
                </div>

                <div className="space-y-3 mb-8 text-sm">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Serveurs:</span>
                    <span className="font-semibold text-white">{plan.servers}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Requêtes/jour:</span>
                    <span className="font-semibold text-white">{plan.requests}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Utilisateurs:</span>
                    <span className="font-semibold text-white">{plan.users}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Support:</span>
                    <span className="font-semibold text-white text-right">{plan.support}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.ctaLink}
                  className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition-all duration-300 ${
                    plan.id === 'free'
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : plan.id === 'pro'
                      ? 'bg-cyan-500 text-slate-900 hover:brightness-110'
                      : plan.id === 'enterprise'
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:brightness-110'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Comparaison Complète
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="px-6 py-4 text-left text-white font-semibold">Fonctionnalité</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">FREE</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">STARTER</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">PRO</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">ENTERPRISE</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Serveurs', free: '1', starter: '5', pro: '50', enterprise: '100+' },
                  { name: 'Requêtes/jour', free: '20', starter: '200', pro: '2,000', enterprise: 'Illimité' },
                  { name: 'Utilisateurs', free: '1', starter: '1', pro: '5', enterprise: '20+' },
                  { name: 'Support Email', free: '✓', starter: '✓', pro: '✓', enterprise: '✓' },
                  { name: 'Support Slack', free: '✗', starter: '✗', pro: '✓', enterprise: '✓' },
                  { name: 'Support Phone', free: '✗', starter: '✗', pro: '✗', enterprise: '✓' },
                  { name: 'Accès API', free: '✗', starter: '✗', pro: '✓', enterprise: '✓' },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-700 ${idx % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'}`}
                  >
                    <td className="px-6 py-4 font-semibold text-white">{row.name}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{row.free}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{row.starter}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{row.pro}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Questions Fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700 transition-colors"
                >
                  <span className="font-semibold text-white text-left">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-400 transition-transform ${
                      expandedFaq === item.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === item.id && (
                  <div className="px-6 py-4 bg-slate-750 border-t border-slate-700 text-gray-300 animate-slide-up">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-400 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Prêt à commencer?
          </h2>
          <p className="text-lg text-gray-100 mb-8">
            Rejoignez 500+ administrateurs système
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Essayer Gratuitement
            </Link>
            <a
              href="/contact"
              className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Contacter Ventes
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage

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
