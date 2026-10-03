import { Router } from 'express';
import { db } from '../db.js';
import { HttpError } from '../errors.js';
import { requireUser } from '../sessions.js';
import { deleteUploads, uploadPath } from '../uploads.js';

export const photosRouter = Router();
photosRouter.use(requireUser);

photosRouter.get('/:id', (req, res) => {
  const photo = findPhoto(req.userId, req.params.id);
  res.set('Cache-Control', 'private, max-age=604800, immutable');
  res.sendFile(uploadPath(photo.filename));
});

photosRouter.delete('/:id', (req, res) => {
  const photo = findPhoto(req.userId, req.params.id);
  db.prepare('DELETE FROM photos WHERE id = ?').run(photo.id);
  deleteUploads([photo.filename]);
  res.status(204).end();
});

function findPhoto(userId, photoId) {
  const photo = db
    .prepare(
      'SELECT photos.* FROM photos JOIN places ON places.id = photos.place_id WHERE photos.id = ? AND places.user_id = ?',
    )
    .get(Number(photoId), userId);
  if (!photo) throw new HttpError(404, 'Fant ikke bildet');
  return photo;
}
