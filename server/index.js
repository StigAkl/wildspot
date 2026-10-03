import path from 'node:path';
import cookieParser from 'cookie-parser';
import express from 'express';
import { handleErrors } from './errors.js';
import { authRouter } from './routes/auth.js';
import { photosRouter } from './routes/photos.js';
import { placesRouter } from './routes/places.js';
import { deleteUploadsOnError } from './uploads.js';

const PORT = Number(process.env.PORT ?? 3000);
const CLIENT_BUILD_DIR = path.resolve('dist');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/places', placesRouter);
app.use('/api/photos', photosRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Ukjent endepunkt' }));

app.use(express.static(CLIENT_BUILD_DIR));
app.get('/{*path}', (_req, res) => res.sendFile(path.join(CLIENT_BUILD_DIR, 'index.html')));

app.use(deleteUploadsOnError);
app.use(handleErrors);

app.listen(PORT, () => console.log(`Wildspot kjører på http://localhost:${PORT}`));
