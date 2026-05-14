import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';

export default async function handler(req, res) {
  const session = await getSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (req.method === 'GET') {
    try {
      const favorites = await prisma.petFavorite.findMany({
        where: { userId: session.user.id },
        include: { pet: true },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ favorites });
    } catch (error) {
      console.error('Get favorites error:', error);
      return res.status(500).json({ error: 'Error al obtener favoritos' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
