import type { Request, Response, NextFunction } from 'express'
import * as repo from '../repositories/siteSettings'
import { single } from '../utils/response'

export async function getPublicSiteSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    single(res, await repo.getSiteProfileSettings())
  } catch (error) {
    next(error)
  }
}

export async function getAdminSiteSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    single(res, await repo.getSiteProfileSettings())
  } catch (error) {
    next(error)
  }
}

export async function updateAdminSiteSettings(req: Request, res: Response, next: NextFunction) {
  try {
    single(res, await repo.updateSiteProfileSettings(req.body))
  } catch (error) {
    next(error)
  }
}

export async function getPublicSiteImages(_req: Request, res: Response, next: NextFunction) {
  try {
    single(res, await repo.getPublicSiteImages())
  } catch (error) {
    next(error)
  }
}

export async function getAdminSiteImages(_req: Request, res: Response, next: NextFunction) {
  try {
    single(res, await repo.getAdminSiteImages())
  } catch (error) {
    next(error)
  }
}

export async function updateAdminSiteImages(req: Request, res: Response, next: NextFunction) {
  try {
    single(res, await repo.updateSiteImages(req.body))
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23503') {
      return res.status(400).json({ success: false, error: 'Selected image is no longer available' })
    }
    next(error)
  }
}
