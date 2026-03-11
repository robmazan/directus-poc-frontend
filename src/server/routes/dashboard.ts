import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /dashboard — protected dashboard
router.get('/dashboard', requireAuth, (_req, res) => {
  res.render('dashboard');
});

export default router;
