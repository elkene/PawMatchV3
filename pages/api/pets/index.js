import { prisma } from '@/lib/prisma';
import { withAuth, withAdmin } from '@/lib/api-helpers';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pets');
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
      const {
        search,
        species,
        size,
        energy,
        page = 1,
        limit = 12,
      } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      let where = { available: true };

      if (species) {
        where.species = species;
      }
      if (size) {
        where.size = size;
      }
      if (energy) {
        where.energy = energy;
      }

      let pets;
      let total;

      if (search) {
        const searchTerm = search.trim();
        const result = await prisma.$queryRaw`
          SELECT * FROM pets
          WHERE available = true
          ${species ? prisma.Prisma.sql`AND species = ${species}` : prisma.Prisma.empty}
          ${size ? prisma.Prisma.sql`AND size = ${size}` : prisma.Prisma.empty}
          ${energy ? prisma.Prisma.sql`AND energy = ${energy}` : prisma.Prisma.empty}
          AND MATCH(name, breed, description) AGAINST(${searchTerm} IN BOOLEAN MODE)
          LIMIT ${skip}, ${limitNum}
        `;
        pets = result;

        const countResult = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM pets
          WHERE available = true
          ${species ? prisma.Prisma.sql`AND species = ${species}` : prisma.Prisma.empty}
          ${size ? prisma.Prisma.sql`AND size = ${size}` : prisma.Prisma.empty}
          ${energy ? prisma.Prisma.sql`AND energy = ${energy}` : prisma.Prisma.empty}
          AND MATCH(name, breed, description) AGAINST(${searchTerm} IN BOOLEAN MODE)
        `;
        total = countResult[0].count;
      } else {
        pets = await prisma.pet.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        });

        total = await prisma.pet.count({ where });
      }

      const totalPages = Math.ceil(total / limitNum);

      return res.status(200).json({
        pets,
        pagination: {
          current: pageNum,
          total: totalPages,
          count: pets.length,
          total_items: total,
        },
      });
    } catch (error) {
      console.error('Get pets error:', error);
      return res.status(500).json({ error: 'Error al obtener mascotas' });
    }
  }

  if (method === 'POST') {
    return withAdmin(async (req, res) => {
      const uploadMiddleware = upload.single('image');

      uploadMiddleware(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: 'Error al subir imagen' });
        }
        if (err) {
          return res.status(500).json({ error: 'Error al procesar archivo' });
        }

        try {
          const {
            name,
            species,
            breed,
            age,
            size,
            energy,
            location,
            description,
            vaccinated,
            sterilized,
            microchip,
          } = req.body;

          const imagePath = req.file ? `/uploads/pets/${req.file.filename}` : null;

          const pet = await prisma.pet.create({
            data: {
              name,
              species,
              breed,
              age: parseInt(age),
              size,
              energy,
              location,
              description: description || null,
              image: imagePath,
              images: JSON.stringify([]),
              vaccinated: vaccinated === 'true',
              sterilized: sterilized === 'true',
              microchip: microchip === 'true',
              available: true,
              compatibility: JSON.stringify({}),
            },
          });

          return res.status(201).json({ pet });
        } catch (error) {
          console.error('Create pet error:', error);
          return res.status(500).json({ error: 'Error al crear mascota' });
        }
      });
    })(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default handler;
