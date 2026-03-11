import { Router } from 'express';
import { createDirectus } from '../services/directus.js';

const router = Router();

// GET /login — show the login form
router.get('/login', (req, res) => {
  if (req.session.directusAuth?.access_token) {
    res.redirect('/');
    return;
  }
  res.render('login', { error: null });
});

// POST /login — authenticate against Directus
router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.render('login', { error: 'Email and password are required.' });
    return;
  }

  try {
    const client = createDirectus();
    const authData = await client.login({ email, password });

    req.session.directusAuth = {
      access_token: authData.access_token ?? '',
      refresh_token: authData.refresh_token ?? '',
      expires: authData.expires ?? undefined,
    };

    const redirectTo = req.session.returnTo ?? '/';
    delete req.session.returnTo;

    res.redirect(redirectTo);
  } catch {
    res.render('login', { error: 'Invalid email or password.' });
  }
});

// POST /logout — clear session and redirect to login
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

export default router;
