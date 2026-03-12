import type { Request, Response, NextFunction } from 'express';
import logger from '../logger.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const hasToken = !!req.session.directusAuth?.access_token;
  if (hasToken) {
    logger.debug({ method: req.method, url: req.originalUrl }, 'requireAuth passed');
    next();
    return;
  }

  logger.warn({ method: req.method, url: req.originalUrl }, 'requireAuth — no session, redirecting to /login');
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}
