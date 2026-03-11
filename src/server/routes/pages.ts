import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getAuthedClient, getPages, getPage } from '../services/directus.js';

const router = Router();

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

// GET / — page index listing (protected)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const client = getAuthedClient(req);
    const pages = await getPages(client);
    res.render('index', { title: 'Pages', pages });
  } catch (err) {
    next(err);
  }
});

// GET /page/:slug — render a single page (protected)
router.get('/page/:slug', requireAuth, async (req, res, next) => {
  try {
    const client = getAuthedClient(req);
    const page = await getPage(client, String(req.params.slug));

    if (!page) {
      res.status(404).render('404', { title: 'Page Not Found' });
      return;
    }

    res.render('page', {
      title: page.title,
      page,
      directusUrl: DIRECTUS_URL,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
