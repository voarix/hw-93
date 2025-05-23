import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'node:crypto';

export const artistImage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const destDir = path.join('./public', 'uploads', 'artists');
    fs.mkdirSync(destDir, { recursive: true });
    cb(null, destDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, randomUUID() + extension);
  },
});

export const albumImage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const destDir = path.join('./public', 'uploads', 'albums');
    fs.mkdirSync(destDir, { recursive: true });
    cb(null, destDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, randomUUID() + extension);
  },
});
