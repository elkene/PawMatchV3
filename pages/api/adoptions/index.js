import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';

export default async function handler(req, res) {
  const { method } = req;
  const session = await getSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (method === 'GET') {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      let where = {};
      if (session.user.role !== 'ADMIN') {
        where.userId = session.user.id;
      }

      const adoptions = await prisma.adoptionRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              location: true,
            },
          },
          pet: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.adoptionRequest.count({ where });
      const totalPages = Math.ceil(total / limitNum);

      return res.status(200).json({
        adoptions,
        pagination: {
          current: pageNum,
          total: totalPages,
          count: adoptions.length,
          total_items: total,
        },
      });
    } catch (error) {
      console.error('Get adoptions error:', error);
      return res.status(500).json({ error: 'Error al obtener solicitudes' });
    }
  }

  if (method === 'POST') {
    try {
      const { petId, message } = req.body;

      if (!petId) {
        return res.status(400).json({ error: 'ID de mascota requerido' });
      }

      const pet = await prisma.pet.findUnique({ where: { id: petId } });
      if (!pet) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
      }

      const existing = await prisma.adoptionRequest.findUnique({
        where: {
          userId_petId: {
            userId: session.user.id,
            petId,
          },
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Ya existe una solicitud para esta mascota' });
      }

      const adoption = await prisma.adoptionRequest.create({
        data: {
          userId: session.user.id,
          petId,
          message: message || null,
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              location: true,
            },
          },
          pet: true,
        },
      });

      return res.status(201).json({ adoption });
    } catch (error) {
      console.error('Create adoption error:', error);
      return res.status(500).json({ error: 'Error al crear solicitud' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
