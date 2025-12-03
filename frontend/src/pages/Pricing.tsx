import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  description: string;
  servers: string | number;
  requests: string | number;
  users: string | number;
  support: string;
  features: string[];
  cta: string;
  ctaLink: string;
  popular: boolean;
  badge?: string;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'FREE',
    monthlyPrice: 0,
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
    monthlyPrice: 29,
    yearlyPrice: 290,
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
    monthlyPrice: 79,
    yearlyPrice: 790,
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
    monthlyPrice: 199,
    yearlyPrice: 1990,
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
];

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqs = [
    {
      id: 'billing',
      question: 'Comment fonctionne la facturation?',
      answer: 'Vous êtes facturé mensuellement ou annuellement en fonction de votre choix. Les plans annuels offrent une réduction de 2 mois.',
    },
    {
      id: 'cancel',
      question: 'Puis-je annuler mon abonnement?',
      answer: 'Oui, vous pouvez annuler votre abonnement à tout moment sans frais supplémentaires. Votre accès sera maintenu jusqu\'à la fin de la période de facturation.',
    },
    {
      id: 'upgrade',
      question: 'Puis-je changer de plan?',
      answer: 'Bien sûr! Vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements prendront effet immédiatement.',
    },
    {
      id: 'trial',
      question: 'Avez-vous un essai gratuit?',
      answer: 'Oui! Notre plan FREE est gratuit et illimité. Essayez AiSystant sans carte de crédit.',
    },
  ];

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
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Contacter les Ventes
          </a>
        </div>
      </div>

      {/* Toggle Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center gap-4 mb-12">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 font-semibold rounded-lg transition ${
                !isAnnual
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 font-semibold rounded-lg transition ${
                isAnnual
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Annuel
            </button>
            {isAnnual && (
              <span className="ml-2 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                Économisez 2 mois ✨
              </span>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl p-8 relative transition transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-cyan-400 shadow-2xl'
                    : 'bg-slate-800 border border-slate-700 hover:border-cyan-400'
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-cyan-400 text-slate-900 px-4 py-1 rounded-bl-lg font-semibold text-sm">
                    {plan.badge}
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-cyan-400">
                    €{isAnnual ? plan.yearlyPrice || plan.monthlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-400 ml-2">
                    /{isAnnual ? 'an' : 'mois'}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-gray-300">
                    <strong className="text-cyan-400">{plan.servers}</strong> serveurs
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-cyan-400">{plan.requests}</strong> requêtes/jour
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-cyan-400">{plan.users}</strong> utilisateur(s)
                  </p>
                  <p className="text-gray-300">Support: <strong className="text-cyan-400">{plan.support}</strong></p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.ctaLink}
                  className={`block text-center py-3 rounded-lg font-semibold transition ${
                    plan.monthlyPrice === 0
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : plan.popular
                      ? 'bg-cyan-400 text-slate-900 hover:brightness-110'
                      : 'bg-blue-600 text-white hover:brightness-110'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Comparison */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Comparaison Détaillée
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="px-4 py-3 text-gray-300 font-semibold">Fonctionnalité</th>
                  {PRICING_PLANS.map((plan) => (
                    <th key={plan.id} className="px-4 py-3 text-cyan-400 font-semibold">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700">
                  <td className="px-4 py-3 text-gray-300">Serveurs</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="px-4 py-3 text-gray-200">{plan.servers}</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-4 py-3 text-gray-300">Requêtes/jour</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="px-4 py-3 text-gray-200">{plan.requests}</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-4 py-3 text-gray-300">Utilisateurs</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="px-4 py-3 text-gray-200">{plan.users}</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-4 py-3 text-gray-300">Support</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="px-4 py-3 text-gray-200">{plan.support}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-300">API Access</td>
                  {PRICING_PLANS.map((plan) => (
                    <td key={plan.id} className="px-4 py-3">
                      {plan.id === 'free' || plan.id === 'starter' ? (
                        <span className="text-red-400">✗</span>
                      ) : (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Questions Fréquentes
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-slate-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700 transition"
                >
                  <span className="text-lg font-semibold text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-400 transition ${
                      expandedFaq === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedFaq === faq.id && (
                  <div className="px-6 py-4 bg-slate-900 border-t border-slate-700">
                    <p className="text-gray-300">{faq.answer}</p>
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
  );
};

export default PricingPage;
