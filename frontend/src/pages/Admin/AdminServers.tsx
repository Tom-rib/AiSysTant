import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { Loader, Server } from 'lucide-react'

interface Server {
  id: number
  name: string
  owner: string
  status: string
  last_activity: string
}

export default function AdminServers() {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

  const limit = 50
  const totalPages = Math.ceil(total / limit)

  useEffect(() => {
    loadServers()
  }, [page, statusFilter])

  const loadServers = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getServers(page, limit)
      setServers(data.servers)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'online') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">✅ Online</span>
    } else if (status === 'offline') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">❌ Offline</span>
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">{status}</span>
  }

  const formatLastActivity = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (diff < 60) return 'now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Servers Monitoring</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Servers</p>
            <p className="text-2xl font-bold text-slate-900">{total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Online</p>
            <p className="text-2xl font-bold text-green-600">{servers.filter(s => s.status === 'online').length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Offline</p>
            <p className="text-2xl font-bold text-red-600">{servers.filter(s => s.status === 'offline').length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Error</p>
            <p className="text-2xl font-bold text-orange-600">{servers.filter(s => s.status === 'error').length}</p>
          </div>
        </div>
      </div>

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
          {/* Servers Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Server Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Owner</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {servers.map((server) => (
                  <tr key={server.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Server size={18} className="text-primary" />
                      {server.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{server.owner}</td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(server.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatLastActivity(server.last_activity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} servers
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
        </>
      )}
    </div>
  )
}
