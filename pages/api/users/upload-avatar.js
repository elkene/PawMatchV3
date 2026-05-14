import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const uploadMiddleware = upload.single('avatar');

  return uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Error al subir archivo' });
    }
    if (err) {
      return res.status(500).json({ error: 'Error al procesar archivo' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó archivo' });
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { avatar: avatarPath },
        select: {
          id: true,
          email: true,
          name: true,
          location: true,
          phone: true,
          bio: true,
          avatar: true,
          role: true,
        },
      });

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Upload avatar error:', error);
      return res.status(500).json({ error: 'Error al subir avatar' });
    }
  });
}

export default handler;
