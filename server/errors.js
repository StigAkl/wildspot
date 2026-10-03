import multer from 'multer';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function handleErrors(error, _req, res, _next) {
  const status = error instanceof multer.MulterError ? 400 : (error.status ?? 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status < 500 ? error.message : 'Noe gikk galt på serveren' });
}
