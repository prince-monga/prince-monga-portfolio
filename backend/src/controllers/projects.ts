import type { Request, Response, NextFunction } from 'express'
import * as repo from '../repositories/projects'
import { paginated, single, param } from '../utils/response'
import { AppError } from '../middleware/errorHandler'

interface ProjectQuery { page: number; limit: number; category?: string; featured?: string }
interface PageQuery { page: number; limit: number }

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, category, featured } = req.query as unknown as ProjectQuery
    const result = await repo.findPublishedProjects({
      page, limit, category,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    })
    paginated(res, result.rows, result.total, page, limit)
  } catch (err) { next(err) }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await repo.findPublishedProjectBySlug(param(req.params.slug))
    if (!project) return next(new AppError(404, 'Project not found'))
    single(res, project)
  } catch (err) { next(err) }
}

export async function adminListProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as PageQuery
    const result = await repo.findAllProjects(page, limit)
    paginated(res, result.rows, result.total, page, limit)
  } catch (err) { next(err) }
}

export async function adminCreateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await repo.insertProject(req.body)
    single(res, project, 201)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') return next(new AppError(409, 'Slug already exists'))
    if ((err as { code?: string }).code === '23503') return next(new AppError(400, 'One or more selected images are no longer available'))
    next(err)
  }
}

export async function adminUpdateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(param(req.params.id), 10)
    const project = await repo.updateProject(id, req.body)
    if (!project) return next(new AppError(404, 'Project not found'))
    single(res, project)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') return next(new AppError(409, 'Slug already exists'))
    if ((err as { code?: string }).code === '23503') return next(new AppError(400, 'One or more selected images are no longer available'))
    next(err)
  }
}

export async function adminDeleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(param(req.params.id), 10)
    const deleted = await repo.deleteProject(id)
    if (!deleted) return next(new AppError(404, 'Project not found'))
    res.status(204).send()
  } catch (err) { next(err) }
}
