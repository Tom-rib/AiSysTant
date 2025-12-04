import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { Loader, DollarSign, TrendingUp } from 'lucide-react'

interface BillingStats {
  mrr: number
  arr: number
  churnRate: number
  usersByPlan: { [key: string]: number }
  revenueTrend: Array<{ month: string; revenue: number }>
}

interface Invoice {
  id: number
  amount: number
  status: string
  issue_date: string
}

export default function AdminBilling() {
  const [stats, setStats] = useState<BillingStats | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [showRefundConfirm, setShowRefundConfirm] = useState<number | null>(null)

  const limit = 50
  const totalPages = Math.ceil(total / limit)

  useEffect(() => {
    loadData()
  }, [page, statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, invoicesData] = await Promise.all([
        adminApi.getBillingStats(),
        adminApi.getInvoices(page, limit, statusFilter)
      ])
      setStats(statsData)
      setInvoices(invoicesData.invoices)
      setTotal(invoicesData.total)
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (invoiceId: number) => {
    try {
      await adminApi.refundInvoice(invoiceId, 'Refunded by admin')
      setInvoices(invoices.map(i => i.id === invoiceId ? { ...i, status: 'refunded' } : i))
      setShowRefundConfirm(null)
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Billing Management</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
          Error: {error}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">MRR</p>
                  <p className="text-2xl font-bold text-slate-900">€{stats?.mrr.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">ARR</p>
                  <p className="text-2xl font-bold text-slate-900">€{stats?.arr.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="transform rotate-90" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Churn Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.churnRate.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users by Plan */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Users by Plan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats?.usersByPlan ? (
                Object.entries(stats.usersByPlan).map(([plan, count]) => (
                  <div key={plan} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">{plan}</p>
                    <p className="text-2xl font-bold text-primary">{count}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
          </div>

          {/* Invoices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Invoices</h2>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">#{invoice.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">€{invoice.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'refunded' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {showRefundConfirm === invoice.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRefund(invoice.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowRefundConfirm(null)}
                              className="px-2 py-1 bg-gray-300 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowRefundConfirm(invoice.id)}
                            disabled={invoice.status !== 'paid'}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} invoices
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-900 font-medium">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
