import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { TrendingUp, Users, DollarSign, Server, Loader } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  monthlyRevenue: number
  totalRevenue: number
  totalServers: number
  totalInvoices: number
  subscriptionByPlan: { [key: string]: number }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminApi.getStats()
      setStats(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
        Error: {error}
      </div>
    )
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: TrendingUp,
      label: 'Active Users (7d)',
      value: stats?.activeUsers || 0,
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: DollarSign,
      label: 'Monthly Revenue',
      value: `€${(stats?.monthlyRevenue || 0).toFixed(2)}`,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Server,
      label: 'Total Servers',
      value: stats?.totalServers || 0,
      color: 'bg-orange-100 text-orange-600'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <p className="text-sm text-gray-600 mb-2">{card.label}</p>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Users by Plan</h2>
        <div className="space-y-2">
          {stats?.subscriptionByPlan ? (
            Object.entries(stats.subscriptionByPlan).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{plan}</span>
                <span className="text-2xl font-bold text-primary">{count}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Total Revenue</h3>
          <p className="text-3xl font-bold text-primary">€{(stats?.totalRevenue || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Total Invoices</h3>
          <p className="text-3xl font-bold text-primary">{stats?.totalInvoices || 0}</p>
        </div>
      </div>
    </div>
  )
}
