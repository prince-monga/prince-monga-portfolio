import type { Request, Response, NextFunction } from 'express'
import * as repo from '../repositories/blog'
import { paginated, single, param } from '../utils/response'
import { AppError } from '../middleware/errorHandler'

interface BlogQuery { page: number; limit: number; category?: string; tag?: string; search?: string }
interface PageQuery { page: number; limit: number }

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, category, tag, search } = req.query as unknown as BlogQuery
    const result = await repo.findPublishedPosts({ page, limit, category, tag, search })
    paginated(res, result.rows, result.total, page, limit)
  } catch (err) { next(err) }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await repo.findPublishedPostBySlug(param(req.params.slug))
    if (!post) return next(new AppError(404, 'Post not found'))
    single(res, post)
  } catch (err) { next(err) }
}

export async function adminListPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as PageQuery
    const result = await repo.findAllPosts(page, limit)
    paginated(res, result.rows, result.total, page, limit)
  } catch (err) { next(err) }
}

export async function adminGetPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await repo.findPostById(parseInt(param(req.params.id), 10))
    if (!post) return next(new AppError(404, 'Post not found'))
    single(res, post)
  } catch (err) { next(err) }
}

export async function adminCreatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await repo.insertPost(req.body)
    single(res, post, 201)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') return next(new AppError(409, 'Slug already exists'))
    if ((err as { code?: string }).code === '23503') return next(new AppError(400, 'One or more selected images are no longer available'))
    next(err)
  }
}

export async function adminUpdatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(param(req.params.id), 10)
    const post = await repo.updatePost(id, req.body)
    if (!post) return next(new AppError(404, 'Post not found'))
    single(res, post)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') return next(new AppError(409, 'Slug already exists'))
    if ((err as { code?: string }).code === '23503') return next(new AppError(400, 'One or more selected images are no longer available'))
    next(err)
  }
}

export async function adminDeletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(param(req.params.id), 10)
    const deleted = await repo.deletePost(id)
    if (!deleted) return next(new AppError(404, 'Post not found'))
    res.status(204).send()
  } catch (err) { next(err) }
}
