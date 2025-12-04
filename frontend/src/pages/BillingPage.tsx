import { useState, useEffect } from 'react'
import { CreditCard, Download, AlertCircle } from 'lucide-react'

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  description: string
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [renewalDate, setRenewalDate] = useState('')

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      // Mock data - À remplacer avec un vrai appel API
      const mockInvoices: Invoice[] = [
        {
          id: 'INV-001',
          date: '2024-12-01',
          amount: 29.99,
          status: 'paid',
          description: 'Plan Starter - Monthly'
        },
        {
          id: 'INV-002',
          date: '2024-11-01',
          amount: 29.99,
          status: 'paid',
          description: 'Plan Starter - Monthly'
        },
        {
          id: 'INV-003',
          date: '2024-10-01',
          amount: 29.99,
          status: 'paid',
          description: 'Plan Starter - Monthly'
        }
      ]

      setInvoices(mockInvoices)
      
      // Calculer la date de renouvellement (30 jours à partir d'aujourd'hui)
      const nextRenewal = new Date()
      nextRenewal.setDate(nextRenewal.getDate() + 30)
      setRenewalDate(nextRenewal.toLocaleDateString('fr-FR'))

      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des données de facturation:', error)
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">✅ Payée</span>
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">⏳ En attente</span>
      case 'failed':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">❌ Échouée</span>
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg p-8 flex items-center justify-center">
        <div className="text-white text-xl">Chargement des données de facturation...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-bg p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Facturation</h1>
        <p className="text-gray-300 mb-8">Gérez votre abonnement et vos factures</p>

        {/* CURRENT PLAN SECTION */}
        <div className="bg-white rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950 mb-2">Plan Actuel</h2>
              <p className="text-lg text-slate-700 mb-4">
                <CreditCard className="inline mr-2 w-5 h-5" />
                <strong>{currentPlan}</strong> - €29.99/mois
              </p>
              <p className="text-slate-600 mb-4">
                Renouvellement le: <strong>{renewalDate}</strong>
              </p>
              <div className="space-y-2 text-slate-700 mb-6">
                <p>📍 <strong>5</strong> serveurs</p>
                <p>📊 <strong>200</strong> requêtes/jour</p>
                <p>👥 <strong>1</strong> utilisateur</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold mb-4">
                ✅ Actif
              </span>
              <div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:brightness-110 transition mr-2">
                  Upgrade
                </button>
                <button className="px-4 py-2 bg-gray-300 text-slate-900 rounded-lg hover:bg-gray-400 transition">
                  Downgrade
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BILLING HISTORY */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950 mb-6">Historique de Facturation</h2>

          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-950">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="pb-3 font-semibold">Numéro</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Montant</th>
                    <th className="pb-3 font-semibold">Statut</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="py-4 font-mono text-sm">{invoice.id}</td>
                      <td className="py-4">{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                      <td className="py-4">{invoice.description}</td>
                      <td className="py-4 font-semibold">€{invoice.amount.toFixed(2)}</td>
                      <td className="py-4">{getStatusBadge(invoice.status)}</td>
                      <td className="py-4">
                        <button className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition">
                          <Download className="w-4 h-4" />
                          <span className="text-sm">PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucune facture disponible</p>
            </div>
          )}
        </div>

        {/* INFO CARD */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900 text-sm">
            💡 Pour modifier votre plan ou vos informations de paiement, visitez l'onglet <strong>Pricing</strong> ou contactez notre support.
          </p>
        </div>
      </div>
    </div>
  )
}
