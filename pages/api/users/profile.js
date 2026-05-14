import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-helpers';

async function handler(req, res) {
  const { method } = req;
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
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

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }

  if (method === 'PUT') {
    try {
      const { name, location, phone, bio, avatar } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(location && { location }),
          ...(phone && { phone }),
          ...(bio && { bio }),
          ...(avatar && { avatar }),
        },
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
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
