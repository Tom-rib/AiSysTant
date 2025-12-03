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
