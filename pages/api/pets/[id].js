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
  const { id } = req.query;
  const { method } = req;

  if (method === 'GET') {
    try {
      const pet = await prisma.pet.findUnique({
        where: { id },
      });

      if (!pet) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }

      return res.status(200).json({ pet });
    } catch (error) {
      console.error('Get pet error:', error);
      return res.status(500).json({ error: 'Error al obtener mascota' });
    }
  }

  if (method === 'PUT') {
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
          const pet = await prisma.pet.findUnique({ where: { id } });

          if (!pet) {
            return res.status(404).json({ error: 'Mascota no encontrada' });
          }

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
            available,
          } = req.body;

          const updateData = {};
          if (name) updateData.name = name;
          if (species) updateData.species = species;
          if (breed) updateData.breed = breed;
          if (age) updateData.age = parseInt(age);
          if (size) updateData.size = size;
          if (energy) updateData.energy = energy;
          if (location) updateData.location = location;
          if (description) updateData.description = description;
          if (vaccinated !== undefined) updateData.vaccinated = vaccinated === 'true';
          if (sterilized !== undefined) updateData.sterilized = sterilized === 'true';
          if (microchip !== undefined) updateData.microchip = microchip === 'true';
          if (available !== undefined) updateData.available = available === 'true';

          if (req.file) {
            updateData.image = `/uploads/pets/${req.file.filename}`;
          }

          const updatedPet = await prisma.pet.update({
            where: { id },
            data: updateData,
          });

          return res.status(200).json({ pet: updatedPet });
        } catch (error) {
          console.error('Update pet error:', error);
          return res.status(500).json({ error: 'Error al actualizar mascota' });
        }
      });
    })(req, res);
  }

  if (method === 'DELETE') {
    return withAdmin(async (req, res) => {
      try {
        const pet = await prisma.pet.findUnique({ where: { id } });

        if (!pet) {
          return res.status(404).json({ error: 'Mascota no encontrada' });
        }

        await prisma.pet.delete({ where: { id } });

        return res.status(200).json({ message: 'Mascota eliminada' });
      } catch (error) {
        console.error('Delete pet error:', error);
        return res.status(500).json({ error: 'Error al eliminar mascota' });
      }
    })(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default handler;
