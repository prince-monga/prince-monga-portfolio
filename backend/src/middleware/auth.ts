import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'

export interface AuthPayload {
  adminId: number
  email: string
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthPayload
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'))
  }

  const token = header.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return next(new AppError(500, 'Server misconfiguration'))
  }

  try {
    const payload = jwt.verify(token, secret) as AuthPayload
    req.admin = payload
    next()
  } catch {
    next(new AppError(401, 'Invalid or expired token'))
  }
}
