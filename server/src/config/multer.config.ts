import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { generateUUID } from '../utils/uuid';

export const avatarStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'avatars'),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${generateUUID()}${ext}`);
  },
});

export const avatarFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP images are allowed'), false);
  }
};

export const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2MB
