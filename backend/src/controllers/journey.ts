import type { Request, Response, NextFunction } from 'express'
import * as repo from '../repositories/journey'
import { paginated, single, param } from '../utils/response'
import { AppError } from '../middleware/errorHandler'

interface JourneyQuery { page: number; limit: number; category?: string }
interface PageQuery { page: number; limit: number }

export async function listJourneyEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, category } = req.query as unknown as JourneyQuery
    const result = await repo.findPublicJourneyEvents({ page, limit, category })
    paginated(res, result.rows, result.total, page, limit)
  } catch (err) { next(err) }
}

export async function adminListJourneyEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as PageQuery
    const result = await repo.findAllJourneyEvents(page, limit)
    paginated(res, result.rows, result.total, page, limit)
  } catch (err) { next(err) }
}

export async function adminCreateJourneyEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await repo.insertJourneyEvent(req.body)
    single(res, event, 201)
  } catch (err) { next(err) }
}

export async function adminUpdateJourneyEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(param(req.params.id), 10)
    const event = await repo.updateJourneyEvent(id, req.body)
    if (!event) return next(new AppError(404, 'Journey event not found'))
    single(res, event)
  } catch (err) { next(err) }
}

export async function adminDeleteJourneyEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(param(req.params.id), 10)
    const deleted = await repo.deleteJourneyEvent(id)
    if (!deleted) return next(new AppError(404, 'Journey event not found'))
    res.status(204).send()
  } catch (err) { next(err) }
}
