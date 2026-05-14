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
      });

      if (!adoption) {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
      }

      if (adoption.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const notes = await prisma.adoptionNote.findMany({
        where: { adoptionRequestId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ notes });
    } catch (error) {
      console.error('Get notes error:', error);
      return res.status(500).json({ error: 'Error al obtener notas' });
    }
  }

  if (method === 'POST') {
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

      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'El contenido de la nota es requerido' });
      }

      const note = await prisma.adoptionNote.create({
        data: {
          adoptionRequestId: id,
          userId: session.user.id,
          role: session.user.role,
          content: content.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      return res.status(201).json({ note });
    } catch (error) {
      console.error('Create note error:', error);
      return res.status(500).json({ error: 'Error al crear nota' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
