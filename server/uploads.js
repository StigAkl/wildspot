import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { UPLOAD_DIR } from './db.js';
import { HttpError } from './errors.js';

const FILE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
};

export const uploadPhotos = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, callback) => callback(null, crypto.randomUUID() + FILE_EXTENSIONS[file.mimetype]),
  }),
  limits: { fileSize: 25 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, callback) => {
    const noFileSelected = !file.originalname;
    if (noFileSelected) return callback(null, false);
    if (!FILE_EXTENSIONS[file.mimetype])
      return callback(new HttpError(400, 'Kun bilder (JPEG, PNG, WebP, HEIC) er tillatt'));
    callback(null, true);
  },
}).array('photos');

export function uploadPath(filename) {
  return path.join(UPLOAD_DIR, filename);
}

export function deleteUploads(filenames) {
  for (const filename of filenames) {
    fs.rm(uploadPath(filename), { force: true }, () => {});
  }
}

export function deleteUploadsOnError(error, req, _res, next) {
  if (req.files?.length) deleteUploads(req.files.map((file) => file.filename));
  next(error);
}
