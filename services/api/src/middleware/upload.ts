import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import fs from 'fs';

const storagePath = path.resolve(config.storage.path);
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, storagePath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${nanoid(16)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} is not allowed`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.storage.maxFileSize },
});

export const uploadImages = upload.array('images', 10);
export const uploadSingleImage = upload.single('image');
export const uploadFiles = upload.array('files', 5);
