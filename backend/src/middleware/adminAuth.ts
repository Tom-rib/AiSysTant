import { Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        role: 'user' | 'admin' | 'super_admin'
      }
    }
  }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No user found' })
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' })
  }

  next()
}

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No user found' })
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden: Super admin access required' })
  }

  next()
}
