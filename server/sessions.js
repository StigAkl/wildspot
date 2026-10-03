import crypto from 'node:crypto';
import { db } from './db.js';

const COOKIE_NAME = 'session';
const SESSION_DAYS = 30;

export function startSession(res, userId) {
  const sessionId = crypto.randomUUID();
  db.prepare(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+${SESSION_DAYS} days'))`,
  ).run(sessionId, userId);
  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function endSession(req, res) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.cookies[COOKIE_NAME] ?? '');
  res.clearCookie(COOKIE_NAME);
}

export function requireUser(req, res, next) {
  const session = db
    .prepare(`SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')`)
    .get(req.cookies[COOKIE_NAME] ?? '');

  if (!session) {
    res.status(401).json({ error: 'Ikke innlogget' });
    return;
  }
  req.userId = session.user_id;
  next();
}
