import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import pagesRouter from './routes/pages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In dev (tsx):  __dirname = <project>/src/server  →  ../.. = <project>
// In prod (tsc): __dirname = <project>/dist/server →  ../.. = <project>
const ROOT = path.resolve(__dirname, '../..');

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── View engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(ROOT, 'views'));

// ── Static assets ────────────────────────────────────────────────────────────
app.use(express.static(path.join(ROOT, 'public')));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ── Session ──────────────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  }),
);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use(authRouter);app.use(pagesRouter);app.use(dashboardRouter);

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
