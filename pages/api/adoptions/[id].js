import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;
  const session = await getSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (method === 'GET') {
    try {
      const adoption = await prisma.adoptionRequest.findUnique({
        where: { id },
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
          notes: {
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!adoption) {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
      }

      if (adoption.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'No autorizado' });
      }

      return res.status(200).json({ adoption });
    } catch (error) {
      console.error('Get adoption error:', error);
      return res.status(500).json({ error: 'Error al obtener solicitud' });
    }
  }

  if (method === 'PUT') {
    try {
      const adoption = await prisma.adoptionRequest.findUnique({
        where: { id },
      });

      if (!adoption) {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
      }

      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo administradores pueden actualizar solicitudes' });
      }

      const { status, message } = req.body;

      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      const updateData = {};
      if (status) updateData.status = status;
      if (message !== undefined) updateData.message = message;

      const updated = await prisma.adoptionRequest.update({
        where: { id },
        data: updateData,
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

      return res.status(200).json({ adoption: updated });
    } catch (error) {
      console.error('Update adoption error:', error);
      return res.status(500).json({ error: 'Error al actualizar solicitud' });
    }
  }

  if (method === 'DELETE') {
    try {
      const adoption = await prisma.adoptionRequest.findUnique({
        where: { id },
      });

      if (!adoption) {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
      }

      if (adoption.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'No autorizado' });
      }

      await prisma.adoptionRequest.delete({ where: { id } });

      return res.status(200).json({ message: 'Solicitud eliminada' });
    } catch (error) {
      console.error('Delete adoption error:', error);
      return res.status(500).json({ error: 'Error al eliminar solicitud' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
