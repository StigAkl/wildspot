import { Router } from 'express';
import { db, inTransaction } from '../db.js';
import { HttpError } from '../errors.js';
import { requireUser } from '../sessions.js';
import { deleteUploads, uploadPhotos } from '../uploads.js';

export const placesRouter = Router();
placesRouter.use(requireUser);

const PLACE_KINDS = ['visited', 'tent_spot'];

placesRouter.get('/', (req, res) => {
  res.json({ places: findPlaces(req.userId) });
});

placesRouter.post('/', uploadPhotos, (req, res) => {
  const place = readPlace(req.body);
  const placeId = inTransaction(() => {
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO places (user_id, kind, title, description, lat, lng, elevation, rating, visited_on)
         VALUES (:user_id, :kind, :title, :description, :lat, :lng, :elevation, :rating, :visited_on)`,
      )
      .run({ ...place, user_id: req.userId });
    savePhotos(lastInsertRowid, req.files);
    return lastInsertRowid;
  });
  res.status(201).json({ place: findPlace(req.userId, placeId) });
});

placesRouter.put('/:id', uploadPhotos, (req, res) => {
  const { id } = findPlace(req.userId, req.params.id);
  const place = readPlace(req.body);
  inTransaction(() => {
    db.prepare(
      `UPDATE places
       SET kind = :kind, title = :title, description = :description, lat = :lat, lng = :lng,
           elevation = :elevation, rating = :rating, visited_on = :visited_on, updated_at = datetime('now')
       WHERE id = :id`,
    ).run({ ...place, id });
    savePhotos(id, req.files);
  });
  res.json({ place: findPlace(req.userId, id) });
});

placesRouter.delete('/:id', (req, res) => {
  const { id } = findPlace(req.userId, req.params.id);
  const photos = db.prepare('SELECT filename FROM photos WHERE place_id = ?').all(id);
  db.prepare('DELETE FROM places WHERE id = ?').run(id);
  deleteUploads(photos.map((photo) => photo.filename));
  res.status(204).end();
});

function readPlace(body) {
  const place = {
    kind: body.kind,
    title: String(body.title ?? '').trim(),
    description: String(body.description ?? '').trim(),
    lat: Number(body.lat),
    lng: Number(body.lng),
    elevation: body.elevation ? Math.round(Number(body.elevation)) : null,
    rating: body.rating ? Number(body.rating) : null,
    visited_on: body.visited_on || null,
  };

  if (!PLACE_KINDS.includes(place.kind)) throw new HttpError(400, 'Ugyldig type sted');
  if (!place.title || place.title.length > 120) throw new HttpError(400, 'Navnet må være 1–120 tegn');
  if (!(Math.abs(place.lat) <= 90 && Math.abs(place.lng) <= 180)) throw new HttpError(400, 'Ugyldig posisjon');
  if (Number.isNaN(place.elevation)) throw new HttpError(400, 'Ugyldig høyde');
  if (place.rating !== null && ![1, 2, 3, 4, 5].includes(place.rating))
    throw new HttpError(400, 'Vurdering må være 1–5');
  if (place.visited_on && !/^\d{4}-\d{2}-\d{2}$/.test(place.visited_on)) throw new HttpError(400, 'Ugyldig dato');

  return place;
}

function findPlaces(userId) {
  const places = db.prepare('SELECT * FROM places WHERE user_id = ? ORDER BY created_at DESC, id DESC').all(userId);
  const photos = db
    .prepare(
      'SELECT photos.id, photos.place_id FROM photos JOIN places ON places.id = photos.place_id WHERE places.user_id = ?',
    )
    .all(userId);
  return places.map((place) => withPhotos(place, photos));
}

function findPlace(userId, placeId) {
  const place = db.prepare('SELECT * FROM places WHERE id = ? AND user_id = ?').get(Number(placeId), userId);
  if (!place) throw new HttpError(404, 'Fant ikke stedet');

  const photos = db.prepare('SELECT id, place_id FROM photos WHERE place_id = ?').all(place.id);
  return withPhotos(place, photos);
}

function withPhotos({ user_id, ...place }, photos) {
  return {
    ...place,
    photos: photos
      .filter((photo) => photo.place_id === place.id)
      .map((photo) => ({ id: photo.id, url: `/api/photos/${photo.id}` })),
  };
}

function savePhotos(placeId, files) {
  const insertPhoto = db.prepare('INSERT INTO photos (place_id, filename) VALUES (?, ?)');
  for (const file of files) insertPhoto.run(placeId, file.filename);
}
