import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { Trash2, Ban, Eye, Loader, Search } from 'lucide-react'

interface User {
  id: number
  email: string
  plan: string
  status: string
  servers: number
  created_at: string
  last_login: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [showBanConfirm, setShowBanConfirm] = useState<number | null>(null)

  const limit = 50
  const totalPages = Math.ceil(total / limit)

  useEffect(() => {
    loadUsers()
  }, [page, search, planFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getUsers(page, limit, { plan: planFilter, status: statusFilter, search })
      setUsers(data.users)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: number) => {
    try {
      await adminApi.deleteUser(userId)
      setUsers(users.filter(u => u.id !== userId))
      setShowDeleteConfirm(null)
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleBan = async (userId: number) => {
    try {
      await adminApi.banUser(userId, 'Banned by admin')
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'banned' } : u))
      setShowBanConfirm(null)
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Users Management</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
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
          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Servers</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' :
                        user.status === 'banned' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.servers}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      {showBanConfirm === user.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBan(user.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setShowBanConfirm(null)}
                            className="px-2 py-1 bg-gray-300 rounded text-xs hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowBanConfirm(user.id)}
                          className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 inline-flex items-center gap-1"
                        >
                          <Ban size={14} /> Ban
                        </button>
                      )}
                      {showDeleteConfirm === user.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="px-2 py-1 bg-red-700 text-white rounded text-xs hover:bg-red-800"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-2 py-1 bg-gray-300 rounded text-xs hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 inline-flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Delete
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
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
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
