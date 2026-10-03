import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { db } from '../db.js';
import { HttpError } from '../errors.js';
import { endSession, requireUser, startSession } from '../sessions.js';

export const authRouter = Router();

const toPublicUser = ({ id, username, email }) => ({ id, username, email });

authRouter.post('/register', async (req, res) => {
  const body = req.body ?? {};
  const username = String(body.username ?? '').trim();
  const email = String(body.email ?? '')
    .trim()
    .toLowerCase();
  const password = String(body.password ?? '');

  if (!/^[\p{L}\p{N}_.-]{2,40}$/u.test(username)) {
    throw new HttpError(400, 'Brukernavn må være 2–40 tegn (bokstaver, tall, _ . -)');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'Ugyldig e-postadresse');
  if (password.length < 8) throw new HttpError(400, 'Passordet må ha minst 8 tegn');

  const existing = db.prepare('SELECT email FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    throw new HttpError(409, existing.email === email ? 'E-posten er allerede registrert' : 'Brukernavnet er opptatt');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
    .run(username, email, passwordHash);

  const userId = Number(lastInsertRowid);
  startSession(res, userId);
  res.status(201).json({ user: { id: userId, username, email } });
});

authRouter.post('/login', async (req, res) => {
  const body = req.body ?? {};
  const email = String(body.email ?? '')
    .trim()
    .toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  const passwordMatches = user && (await bcrypt.compare(String(body.password ?? ''), user.password_hash));

  if (!passwordMatches) throw new HttpError(401, 'Feil e-post eller passord');

  startSession(res, user.id);
  res.json({ user: toPublicUser(user) });
});

authRouter.post('/logout', (req, res) => {
  endSession(req, res);
  res.status(204).end();
});

authRouter.get('/me', requireUser, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  res.json({ user: toPublicUser(user) });
});
