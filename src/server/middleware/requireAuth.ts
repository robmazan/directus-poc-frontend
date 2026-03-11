import type { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session.directusAuth?.access_token) {
    next();
    return;
  }

  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}
