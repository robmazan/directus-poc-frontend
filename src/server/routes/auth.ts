import { Router } from 'express';
import { createDirectus } from '../services/directus.js';
import logger from '../logger.js';

const router = Router();

// GET /login — show the login form
router.get('/login', (req, res) => {
  const hasSession = !!req.session.directusAuth?.access_token;
  logger.debug({ hasSession }, 'GET /login');
  if (hasSession) {
    res.redirect('/');
    return;
  }
  res.render('login', { error: null });
});

// POST /login — authenticate against Directus
router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  logger.debug({ email, passwordProvided: !!password }, 'POST /login attempt');

  if (!email || !password) {
    logger.warn({ email, passwordProvided: !!password }, 'POST /login rejected — missing credentials');
    res.render('login', { error: 'Email and password are required.' });
    return;
  }

  try {
    const client = createDirectus();
    logger.debug({ email }, 'Calling Directus login');
    const authData = await client.login({ email, password });
    logger.debug(
      { accessToken: !!authData.access_token, refreshToken: !!authData.refresh_token, expires: authData.expires },
      'Directus login response',
    );

    req.session.directusAuth = {
      access_token: authData.access_token ?? '',
      refresh_token: authData.refresh_token ?? '',
      expires: authData.expires ?? undefined,
    };

    const redirectTo = req.session.returnTo ?? '/';
    delete req.session.returnTo;

    req.session.save((saveErr) => {
      if (saveErr) {
        logger.error({ err: saveErr }, 'Session save failed');
        res.render('login', { error: 'Session could not be saved. Please try again.' });
        return;
      }
      logger.info({ email, redirectTo }, 'Login successful — session saved');
      res.redirect(redirectTo);
    });
  } catch (err) {
    logger.error({ err, email }, 'Directus login failed');
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
