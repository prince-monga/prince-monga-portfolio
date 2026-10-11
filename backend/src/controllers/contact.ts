import type { Request, Response, NextFunction } from 'express'
import * as repo from '../repositories/contact'
import { paginated, single, param } from '../utils/response'
import { AppError } from '../middleware/errorHandler'

interface PageQuery { page: number; limit: number }

export async function submitContact(req: Request, res: Response, next: NextFunction) {
  try {
    const inquiry = await repo.insertInquiry(req.body)
    // Email integration is not configured — truthfully confirm receipt only
    single(res, {
      id: inquiry.id,
      message: 'Your enquiry has been received. I will get back to you soon.',
    }, 201)
  } catch (err) { next(err) }
}

export async function adminListInquiries(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as PageQuery
    const result = await repo.findAllInquiries(page, limit)
    paginated(res, result.rows, result.total, page, limit)
  } catch (err) { next(err) }
}

export async function adminUpdateInquiryStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(param(req.params.id), 10)
    const { status } = req.body as { status: string }
    const validStatuses = ['new', 'read', 'replied', 'archived']
    if (!validStatuses.includes(status)) {
      return next(new AppError(400, `Status must be one of: ${validStatuses.join(', ')}`))
    }
    const inquiry = await repo.updateInquiryStatus(id, status)
    if (!inquiry) return next(new AppError(404, 'Inquiry not found'))
    single(res, inquiry)
  } catch (err) { next(err) }
}

export async function adminDeleteInquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(param(req.params.id), 10)
    const deleted = await repo.deleteInquiry(id)
    if (!deleted) return next(new AppError(404, 'Inquiry not found'))
    res.status(204).send()
  } catch (err) { next(err) }
}
