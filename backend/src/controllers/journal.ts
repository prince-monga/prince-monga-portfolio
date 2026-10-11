import type { Request, Response, NextFunction } from 'express'
import * as repo from '../repositories/journal'
import { paginated, single, param } from '../utils/response'
import { AppError } from '../middleware/errorHandler'

interface LogQuery { page: number; limit: number; month?: string }
interface PageQuery { page: number; limit: number }

export async function listPublicLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, month } = req.query as unknown as LogQuery
    const result = await repo.findPublicDailyLogs({ page, limit, month })
    paginated(res, result.rows, result.total, page, limit)
  } catch (err) { next(err) }
}

export async function adminListLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as PageQuery
    const result = await repo.findAllDailyLogs(page, limit)
    paginated(res, result.rows, result.total, page, limit)
  } catch (err) { next(err) }
}

export async function adminCreateLog(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await repo.insertDailyLog(req.body)
    single(res, log, 201)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') return next(new AppError(409, 'A log for this date already exists'))
    next(err)
  }
}

export async function adminUpdateLog(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(param(req.params.id), 10)
    const log = await repo.updateDailyLog(id, req.body)
    if (!log) return next(new AppError(404, 'Log not found'))
    single(res, log)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      return next(new AppError(409, 'A log for this date already exists'))
    }
    next(err)
  }
}

export async function adminDeleteLog(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(param(req.params.id), 10)
    const deleted = await repo.deleteDailyLog(id)
    if (!deleted) return next(new AppError(404, 'Log not found'))
    res.status(204).send()
  } catch (err) { next(err) }
}
