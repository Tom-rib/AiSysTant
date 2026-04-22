import { Router, Response, RequestHandler } from 'express'
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth'
import { AdminService } from '../services/adminService'

const router = Router()

// GET /api/admin/stats
router.get('/stats', authenticate as RequestHandler, requireAdmin as RequestHandler, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await AdminService.getStats()
    res.json(stats)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/admin/users
router.get('/users', authenticate as RequestHandler, requireAdmin as RequestHandler, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const filters = {
      plan: req.query.plan as string,
      status: req.query.status as string,
      search: req.query.search as string
    }

    const result = await AdminService.getUsers(page, limit, filters)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/admin/users/:userId
router.get('/users/:userId', authenticate as RequestHandler, requireAdmin as RequestHandler, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId)
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    const user = await AdminService.getUserById(userId)
    res.json(user)
  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ error: error.message })
  }
})

// PUT /api/admin/users/:userId
router.put('/users/:userId', authenticate as RequestHandler, requireAdmin as RequestHandler, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId)
    const { plan_id } = req.body

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    if (plan_id) {
      await AdminService.upgradeUserPlan(userId, plan_id)
    }

    res.json({ message: 'User updated successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/admin/users/:userId/ban
router.post('/users/:userId/ban', authenticate as RequestHandler, requireAdmin as RequestHandler, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId)
    const { reason } = req.body

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    if (req.user?.id === userId) {
      return res.status(400).json({ error: 'Cannot ban yourself' })
    }

    await AdminService.banUser(userId, reason)
    res.json({ message: 'User banned successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/admin/users/:userId
router.delete('/users/:userId', authenticate as RequestHandler, requireAdmin as RequestHandler, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId)

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    if (req.user?.id === userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' })
    }

    await AdminService.deleteUser(userId)
    res.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/admin/billing
router.get('/billing', authenticate as RequestHandler, requireAdmin as RequestHandler, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await AdminService.getBillingStats()
    res.json(stats)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/admin/invoices
router.get('/invoices', authenticate as RequestHandler, requireAdmin as RequestHandler, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const status = req.query.status as string

    const result = await AdminService.getInvoices(page, limit, status)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/admin/invoices/:invoiceId/refund
router.post('/invoices/:invoiceId/refund', authenticate as RequestHandler, requireAdmin as RequestHandler, async (req: AuthRequest, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId)
    const { reason } = req.body

    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' })
    }

    await AdminService.refundInvoice(invoiceId, reason)
    res.json({ message: 'Invoice refunded successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/admin/servers
router.get('/servers', authenticate as RequestHandler, requireAdmin as RequestHandler, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50

    const result = await AdminService.getServers(page, limit)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
