import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message })
    return
  }

  // Handle Express body-parser PayloadTooLargeError
  if (
    typeof err === 'object' && err !== null &&
    (err as { type?: string }).type === 'entity.too.large'
  ) {
    res.status(413).json({ success: false, error: 'Request body too large' })
    return
  }

  // Unexpected errors — log internally, never expose details
  const errorName = err instanceof Error ? err.name : 'UnknownError'
  const errorCode =
    typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string'
      ? err.code
      : undefined
  const sqlState = errorCode && /^[0-9A-Z]{5}$/.test(errorCode) ? errorCode : undefined
  console.error('Unhandled request error:', {
    errorName,
    ...(sqlState ? { sqlState } : {}),
  })
  res.status(500).json({ success: false, error: 'Internal server error' })
}
