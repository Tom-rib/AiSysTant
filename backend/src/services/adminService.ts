import db from '../config/database'

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

export class AdminService {
  static async getStats(): Promise<AdminStats> {
    try {
      const totalUsersResult = await db.query('SELECT COUNT(*) as count FROM users')
      const totalUsers = parseInt(totalUsersResult.rows[0].count)

      const activeUsersResult = await db.query(
        `SELECT COUNT(*) as count FROM users WHERE last_login > NOW() - INTERVAL '7 days'`
      )
      const activeUsers = parseInt(activeUsersResult.rows[0].count)

      const monthlyRevenueResult = await db.query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM invoices 
         WHERE status = 'paid' AND EXTRACT(MONTH FROM issue_date) = EXTRACT(MONTH FROM NOW())
         AND EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM NOW())`
      )
      const monthlyRevenue = parseFloat(monthlyRevenueResult.rows[0].total)

      const totalRevenueResult = await db.query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid'`
      )
      const totalRevenue = parseFloat(totalRevenueResult.rows[0].total)

      const totalServersResult = await db.query('SELECT COUNT(*) as count FROM ssh_servers')
      const totalServers = parseInt(totalServersResult.rows[0].count)

      const totalInvoicesResult = await db.query('SELECT COUNT(*) as count FROM invoices')
      const totalInvoices = parseInt(totalInvoicesResult.rows[0].count)

      const planBreakdownResult = await db.query(
        `SELECT plan_name, COUNT(*) as count FROM user_subscriptions 
         JOIN subscription_plans ON user_subscriptions.plan_id = subscription_plans.id
         GROUP BY plan_name`
      )
      const subscriptionByPlan: { [key: string]: number } = {}
      planBreakdownResult.rows.forEach(row => {
        subscriptionByPlan[row.plan_name] = parseInt(row.count)
      })

      return {
        totalUsers,
        activeUsers,
        monthlyRevenue,
        totalRevenue,
        totalServers,
        totalInvoices,
        subscriptionByPlan
      }
    } catch (error) {
      console.error('Error getting admin stats:', error)
      throw error
    }
  }

  static async getUsers(
    page: number = 1,
    limit: number = 50,
    filters?: { plan?: string; status?: string; search?: string }
  ): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    try {
      let query = `
        SELECT u.id, u.email, sp.plan_name as plan, u.status, COUNT(ss.id) as servers, 
               u.created_at, u.last_login
        FROM users u
        LEFT JOIN user_subscriptions us ON u.id = us.user_id
        LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
        LEFT JOIN ssh_servers ss ON u.id = ss.user_id
        WHERE 1=1
      `

      if (filters?.plan) {
        query += ` AND sp.plan_name = '${filters.plan}'`
      }
      if (filters?.status) {
        query += ` AND u.status = '${filters.status}'`
      }
      if (filters?.search) {
        query += ` AND u.email ILIKE '%${filters.search}%'`
      }

      query += ` GROUP BY u.id, sp.plan_name`

      const totalResult = await db.query(`SELECT COUNT(DISTINCT u.id) as count FROM (${query}) subq`)
      const total = parseInt(totalResult.rows[0].count)

      const offset = (page - 1) * limit
      query += ` ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`

      const result = await db.query(query)
      const totalPages = Math.ceil(total / limit)

      return { users: result.rows, total, page, totalPages }
    } catch (error) {
      console.error('Error getting users:', error)
      throw error
    }
  }

  static async getUserById(userId: number): Promise<any> {
    try {
      const userResult = await db.query(
        `SELECT u.id, u.email, sp.plan_name as plan, u.status, u.two_factor_enabled as twoFA,
                COUNT(DISTINCT ss.id) as servers, u.created_at, u.last_login
         FROM users u
         LEFT JOIN user_subscriptions us ON u.id = us.user_id
         LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
         LEFT JOIN ssh_servers ss ON u.id = ss.user_id
         WHERE u.id = $1
         GROUP BY u.id, sp.plan_name`,
        [userId]
      )

      if (userResult.rows.length === 0) {
        throw new Error('User not found')
      }

      const user = userResult.rows[0]

      const invoicesResult = await db.query(
        `SELECT id, amount, status, issue_date FROM invoices WHERE user_id = $1 
         ORDER BY issue_date DESC LIMIT 5`,
        [userId]
      )

      return { ...user, invoices: invoicesResult.rows }
    } catch (error) {
      console.error('Error getting user by ID:', error)
      throw error
    }
  }

  static async banUser(userId: number, reason?: string): Promise<{ message: string }> {
    try {
      const checkResult = await db.query('SELECT id FROM users WHERE id = $1', [userId])
      if (checkResult.rows.length === 0) {
        throw new Error('User not found')
      }

      await db.query('UPDATE users SET status = $1 WHERE id = $2', ['banned', userId])
      await this.logAdminAction(userId, 'ban_user', 'user', userId, { reason })

      return { message: 'User banned successfully' }
    } catch (error) {
      console.error('Error banning user:', error)
      throw error
    }
  }

  static async deleteUser(userId: number): Promise<{ message: string }> {
    try {
      await db.query('DELETE FROM users WHERE id = $1', [userId])
      await this.logAdminAction(userId, 'delete_user', 'user', userId, {})

      return { message: 'User deleted successfully' }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  static async upgradeUserPlan(userId: number, newPlanId: number): Promise<{ message: string }> {
    try {
      await db.query(
        'UPDATE user_subscriptions SET plan_id = $1 WHERE user_id = $2',
        [newPlanId, userId]
      )
      await this.logAdminAction(userId, 'upgrade_plan', 'subscription', userId, { newPlanId })

      return { message: 'User plan upgraded successfully' }
    } catch (error) {
      console.error('Error upgrading user plan:', error)
      throw error
    }
  }

  static async getBillingStats(): Promise<BillingStats> {
    try {
      const mrrResult = await db.query(
        `SELECT COALESCE(SUM(CASE WHEN billing_cycle = 'monthly' THEN amount ELSE 0 END), 0) as mrr
         FROM invoices WHERE status = 'paid' AND issue_date >= NOW() - INTERVAL '1 month'`
      )
      const mrr = parseFloat(mrrResult.rows[0].mrr)

      const arrResult = await db.query(
        `SELECT COALESCE(SUM(CASE WHEN billing_cycle = 'annual' THEN amount ELSE 0 END) * 12, 0) as arr
         FROM invoices WHERE status = 'paid' AND issue_date >= NOW() - INTERVAL '1 year'`
      )
      const arr = parseFloat(arrResult.rows[0].arr)

      const churnResult = await db.query(
        `SELECT COUNT(*) as churned FROM users WHERE status = 'inactive' 
         AND updated_at >= NOW() - INTERVAL '1 month'`
      )
      const totalActiveResult = await db.query('SELECT COUNT(*) as total FROM users WHERE status = $1', ['active'])
      const churnRate = totalActiveResult.rows[0].total > 0 
        ? (parseInt(churnResult.rows[0].churned) / parseInt(totalActiveResult.rows[0].total)) * 100 
        : 0

      const planResult = await db.query(
        `SELECT plan_name, COUNT(*) as count FROM user_subscriptions 
         JOIN subscription_plans ON user_subscriptions.plan_id = subscription_plans.id
         GROUP BY plan_name`
      )
      const usersByPlan: { [key: string]: number } = {}
      planResult.rows.forEach(row => {
        usersByPlan[row.plan_name] = parseInt(row.count)
      })

      const trendResult = await db.query(
        `SELECT TO_CHAR(issue_date, 'YYYY-MM') as month, SUM(amount) as revenue
         FROM invoices WHERE status = 'paid' GROUP BY month ORDER BY month DESC LIMIT 12`
      )
      const revenueTrend = trendResult.rows.map(row => ({
        month: row.month,
        revenue: parseFloat(row.revenue)
      }))

      return { mrr, arr, churnRate, usersByPlan, revenueTrend }
    } catch (error) {
      console.error('Error getting billing stats:', error)
      throw error
    }
  }

  static async getInvoices(
    page: number = 1,
    limit: number = 50,
    status?: string
  ): Promise<{ invoices: Invoice[]; total: number; page: number }> {
    try {
      let query = 'SELECT i.id, i.amount, i.status, i.issue_date, u.email FROM invoices i JOIN users u ON i.user_id = u.id WHERE 1=1'

      if (status) {
        query += ` AND i.status = '${status}'`
      }

      const totalResult = await db.query(`SELECT COUNT(*) as count FROM invoices ${status ? `WHERE status = '${status}'` : ''}`)
      const total = parseInt(totalResult.rows[0].count)

      const offset = (page - 1) * limit
      query += ` ORDER BY i.issue_date DESC LIMIT ${limit} OFFSET ${offset}`

      const result = await db.query(query)

      return { invoices: result.rows, total, page }
    } catch (error) {
      console.error('Error getting invoices:', error)
      throw error
    }
  }

  static async refundInvoice(invoiceId: number, reason?: string): Promise<{ message: string }> {
    try {
      await db.query('UPDATE invoices SET status = $1 WHERE id = $2', ['refunded', invoiceId])
      await this.logAdminAction(invoiceId, 'refund_invoice', 'invoice', invoiceId, { reason })

      return { message: 'Invoice refunded successfully' }
    } catch (error) {
      console.error('Error refunding invoice:', error)
      throw error
    }
  }

  static async getServers(page: number = 1, limit: number = 50): Promise<{ servers: Server[]; total: number; page: number }> {
    try {
      const totalResult = await db.query('SELECT COUNT(*) as count FROM ssh_servers')
      const total = parseInt(totalResult.rows[0].count)

      const offset = (page - 1) * limit
      const result = await db.query(
        `SELECT ss.id, ss.name, u.email as owner, ss.status, ss.last_activity
         FROM ssh_servers ss
         JOIN users u ON ss.user_id = u.id
         ORDER BY ss.created_at DESC
         LIMIT ${limit} OFFSET ${offset}`
      )

      return { servers: result.rows, total, page }
    } catch (error) {
      console.error('Error getting servers:', error)
      throw error
    }
  }

  static async logAdminAction(
    adminId: number,
    action: string,
    targetType: string,
    targetId: number,
    details?: object
  ): Promise<{ id: number }> {
    try {
      const result = await db.query(
        `INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id`,
        [adminId, action, targetType, targetId, JSON.stringify(details || {})]
      )
      return { id: result.rows[0].id }
    } catch (error) {
      console.error('Error logging admin action:', error)
      throw error
    }
  }
}
