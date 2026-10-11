import type { Request, Response, NextFunction } from 'express'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { findAdminByEmail } from '../repositories/admin'
import { AppError } from '../middleware/errorHandler'
import { single } from '../utils/response'

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string }

    const admin = await findAdminByEmail(email)
    // Always verify to prevent timing attacks even when user not found
    const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$dummysaltdummysalt$dummyhash'
    const hash = admin?.password_hash ?? dummyHash

    const valid = await argon2.verify(hash, password).catch(() => false)

    if (!admin || !valid) {
      return next(new AppError(401, 'Invalid email or password'))
    }

    const secret = process.env.JWT_SECRET
    if (!secret) return next(new AppError(500, 'Server misconfiguration'))

    const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn']
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      secret,
      { expiresIn }
    )

    single(res, { token, email: admin.email })
  } catch (err) { next(err) }
}
