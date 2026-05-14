import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'lost-pets');
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

  if (method === 'GET') {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      let where = {};
      if (status && ['LOST', 'FOUND', 'RESOLVED'].includes(status)) {
        where.status = status;
      }

      const reports = await prisma.lostPetReport.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.lostPetReport.count({ where });
      const totalPages = Math.ceil(total / limitNum);

      const serializedReports = reports.map((report) => ({
        ...report,
        latitude: report.latitude ? parseFloat(report.latitude.toString()) : null,
        longitude: report.longitude ? parseFloat(report.longitude.toString()) : null,
        images: report.images ? (typeof report.images === 'string' ? JSON.parse(report.images) : report.images) : [],
      }));

      return res.status(200).json({
        reports: serializedReports,
        pagination: {
          current: pageNum,
          total: totalPages,
          count: serializedReports.length,
          total_items: total,
        },
      });
    } catch (error) {
      console.error('Get lost pets error:', error);
      return res.status(500).json({ error: 'Error al obtener reportes' });
    }
  }

  if (method === 'POST') {
    const session = await getSession(req, res);

    if (!session?.user?.id) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const uploadMiddleware = upload.array('images', 5);

    return uploadMiddleware(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'Error al subir imágenes' });
      }
      if (err) {
        return res.status(500).json({ error: 'Error al procesar archivos' });
      }

      try {
        const {
          title,
          description,
          species,
          breed,
          lastSeenLocation,
          latitude,
          longitude,
          contactPhone,
          contactEmail,
        } = req.body;

        if (!title || !species || !lastSeenLocation || !latitude || !longitude || !contactPhone || !contactEmail) {
          return res.status(400).json({ error: 'Campos requeridos faltantes' });
        }

        const imagePaths = (req.files || []).map((file) => `/uploads/lost-pets/${file.filename}`);

        const report = await prisma.lostPetReport.create({
          data: {
            id: uuid(),
            userId: session.user.id,
            title,
            description: description || null,
            species,
            breed: breed || null,
            lastSeenLocation,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            contactPhone,
            contactEmail,
            status: 'LOST',
            images: JSON.stringify(imagePaths),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        });

        return res.status(201).json({
          report: {
            ...report,
            latitude: parseFloat(report.latitude.toString()),
            longitude: parseFloat(report.longitude.toString()),
            images: report.images ? JSON.parse(report.images) : [],
          },
        });
      } catch (error) {
        console.error('Create lost pet error:', error);
        return res.status(500).json({ error: 'Error al crear reporte' });
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default handler;
