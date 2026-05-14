import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  const session = await getSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (method === 'POST') {
    try {
      const pet = await prisma.pet.findUnique({ where: { id } });
      if (!pet) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }

      const existing = await prisma.petFavorite.findUnique({
        where: {
          userId_petId: {
            userId: session.user.id,
            petId: id,
          },
        },
      });

      if (existing) {
        return res.status(200).json({ favorite: existing, message: 'Ya está en favoritos' });
      }

      const favorite = await prisma.petFavorite.create({
        data: {
          userId: session.user.id,
          petId: id,
        },
      });

      return res.status(201).json({ favorite });
    } catch (error) {
      console.error('Add favorite error:', error);
      return res.status(500).json({ error: 'Error al agregar a favoritos', details: error.message });
    }
  }

  if (method === 'DELETE') {
    try {
      const result = await prisma.petFavorite.deleteMany({
        where: {
          userId: session.user.id,
          petId: id,
        },
      });

      return res.status(200).json({ message: 'Eliminado de favoritos', deleted: result.count });
    } catch (error) {
      console.error('Remove favorite error:', error);
      return res.status(500).json({ error: 'Error al eliminar de favoritos', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
