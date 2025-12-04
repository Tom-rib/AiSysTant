import axios from 'axios'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  monthlyRevenue: number
  totalRevenue: number
  totalServers: number
  totalInvoices: number
  subscriptionByPlan: { [key: string]: number }
}

interface User {
  id: number
  email: string
  plan: string
  status: string
  servers: number
  created_at: string
  last_login: string
}

interface UserDetail extends User {
  twoFA: boolean
  invoices: Invoice[]
}

interface Invoice {
  id: number
  amount: number
  status: string
  issue_date: string
}

interface Server {
  id: number
  name: string
  owner: string
  status: string
  last_activity: string
}

interface BillingStats {
  mrr: number
  arr: number
  churnRate: number
  usersByPlan: { [key: string]: number }
  revenueTrend: Array<{ month: string; revenue: number }>
}

const api = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    try {
      const response = await api.get('/stats')
      return response.data
    } catch (error) {
      console.error('Error getting admin stats:', error)
      throw error
    }
  },

  getUsers: async (
    page: number = 1,
    limit: number = 50,
    filters?: { plan?: string; status?: string; search?: string }
  ): Promise<{ users: User[]; total: number; page: number; totalPages: number }> => {
    try {
      const params = { page, limit, ...filters }
      const response = await api.get('/users', { params })
      return response.data
    } catch (error) {
      console.error('Error getting users:', error)
      throw error
    }
  },

  getUserById: async (userId: number): Promise<UserDetail> => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  },

  banUser: async (userId: number, reason?: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/users/${userId}/ban`, { reason })
      return response.data
    } catch (error) {
      console.error('Error banning user:', error)
      throw error
    }
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  upgradeUserPlan: async (userId: number, planId: number): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/users/${userId}`, { plan_id: planId })
      return response.data
    } catch (error) {
      console.error('Error upgrading user plan:', error)
      throw error
    }
  },

  getBillingStats: async (): Promise<BillingStats> => {
    try {
      const response = await api.get('/billing')
      return response.data
    } catch (error) {
      console.error('Error getting billing stats:', error)
      throw error
    }
  },

  getInvoices: async (
    page: number = 1,
    limit: number = 50,
    status?: string
  ): Promise<{ invoices: Invoice[]; total: number; page: number }> => {
    try {
      const params = { page, limit }
      if (status) params.status = status
      const response = await api.get('/invoices', { params })
      return response.data
    } catch (error) {
      console.error('Error getting invoices:', error)
      throw error
    }
  },

  refundInvoice: async (invoiceId: number, reason?: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/invoices/${invoiceId}/refund`, { reason })
      return response.data
    } catch (error) {
      console.error('Error refunding invoice:', error)
      throw error
    }
  },

  getServers: async (
    page: number = 1,
    limit: number = 50
  ): Promise<{ servers: Server[]; total: number; page: number }> => {
    try {
      const params = { page, limit }
      const response = await api.get('/servers', { params })
      return response.data
    } catch (error) {
      console.error('Error getting servers:', error)
      throw error
    }
  }
}
