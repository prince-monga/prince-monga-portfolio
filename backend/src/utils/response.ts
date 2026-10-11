import type { Response } from 'express'

export function paginated<T>(
  res: Response,
  rows: T[],
  total: number,
  page: number,
  limit: number
): void {
  res.json({
    success: true,
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export function single<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data })
}

/** Safely extract a string param from Express req.params */
export function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value
}
