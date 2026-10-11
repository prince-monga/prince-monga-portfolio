import type { Request, Response, NextFunction } from 'express'
import * as repo from '../repositories/timeline'

interface TimelineQuery { from: string; to: string; timeZone: string }

export async function listPublicTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to, timeZone } = req.query as unknown as TimelineQuery
    const items = await repo.findPublicTimeline({ from, to, timeZone })
    res.json({ success: true, data: items, time_zone: timeZone })
  } catch (err) { next(err) }
}