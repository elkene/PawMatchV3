import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;
  const session = await getSession(req, res);

  if (method === 'GET') {
    try {
      const report = await prisma.lostPetReport.findUnique({
        where: { id },
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

      if (!report) {
        return res.status(404).json({ error: 'Reporte no encontrado' });
      }

      return res.status(200).json({ report });
    } catch (error) {
      console.error('Get lost pet error:', error);
      return res.status(500).json({ error: 'Error al obtener reporte' });
    }
  }

  if (method === 'PUT') {
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    try {
      console.log('PUT /api/lost-pets/[id] - Iniciando...');
      console.log('Report ID:', id);
      console.log('Session user:', session.user.id);
      console.log('Request body:', req.body);

      const report = await prisma.lostPetReport.findUnique({
        where: { id },
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

      if (!report) {
        return res.status(404).json({ error: 'Reporte no encontrado' });
      }

      console.log('Reporte encontrado:', report.id);

      const isCreator = report.userId === session.user.id;
      const isHelper = report.helperId === session.user.id;
      const isAdmin = session.user.role === 'ADMIN';

      console.log('Permisos - isCreator:', isCreator, 'isHelper:', isHelper, 'isAdmin:', isAdmin);

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
        status,
        helperId,
      } = req.body;

      const updateData = {};

      console.log('helperId recibido:', helperId, 'tipo:', typeof helperId);

      // Solo el creador puede editar datos del reporte
      if (isCreator || isAdmin) {
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (species !== undefined) updateData.species = species;
        if (breed !== undefined) updateData.breed = breed;
        if (lastSeenLocation !== undefined) updateData.lastSeenLocation = lastSeenLocation;
        if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
        if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
        if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
        if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
      }

      // Cualquier usuario puede asignarse como ayudante (sin validaciones)
      if (helperId) {
        console.log('Setting helperId to:', helperId);
        updateData.helperId = helperId;
      }

      // Solo el helper asignado puede cambiar el status
      if (status !== undefined) {
        const validStatuses = ['LOST', 'FOUND', 'RESOLVED'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Estado inválido' });
        }
        if (!isHelper && !isAdmin) {
          return res.status(403).json({ error: 'Solo el ayudante asignado puede cambiar el estado' });
        }
        updateData.status = status;
      }

      console.log('updateData:', updateData);

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No hay cambios para actualizar' });
      }

      console.log('Intentando actualizar con datos:', updateData);

      try {
        const updateResult = await prisma.lostPetReport.update({
          where: { id },
          data: updateData,
        });
        console.log('Update exitoso:', updateResult);
      } catch (updateError) {
        console.error('Error en update:', updateError.message);
        console.error('Error code:', updateError.code);
        console.error('Error meta:', updateError.meta);
        throw updateError;
      }

      // Re-fetch con serialización correcta
      const updated = await prisma.lostPetReport.findUnique({
        where: { id },
      });

      console.log('Re-fetch exitoso');

      const serialized = {
        id: updated.id,
        userId: updated.userId,
        helperId: updated.helperId,
        title: updated.title,
        description: updated.description,
        species: updated.species,
        breed: updated.breed,
        lastSeenLocation: updated.lastSeenLocation,
        latitude: updated.latitude ? parseFloat(updated.latitude.toString()) : null,
        longitude: updated.longitude ? parseFloat(updated.longitude.toString()) : null,
        contactPhone: updated.contactPhone,
        contactEmail: updated.contactEmail,
        status: updated.status,
        images: updated.images ? (typeof updated.images === 'string' ? JSON.parse(updated.images) : updated.images) : [],
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        user: report.user,
      };

      console.log('Serialización completa, retornando respuesta');
      return res.status(200).json({ report: serialized });
    } catch (error) {
      console.error('Update lost pet error:', error.message);
      console.error('Stack:', error.stack);
      return res.status(500).json({
        error: 'Error al actualizar reporte',
        details: error.message,
        stack: error.stack
      });
    }
  }

  if (method === 'DELETE') {
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    try {
      const report = await prisma.lostPetReport.findUnique({
        where: { id },
      });

      if (!report) {
        return res.status(404).json({ error: 'Reporte no encontrado' });
      }

      if (report.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'No autorizado' });
      }

      await prisma.lostPetReport.delete({ where: { id } });

      return res.status(200).json({ message: 'Reporte eliminado' });
    } catch (error) {
      console.error('Delete lost pet error:', error);
      return res.status(500).json({ error: 'Error al eliminar reporte' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
