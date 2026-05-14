import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';
import { v4 as uuid } from 'uuid';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      const donations = await prisma.donation.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.donation.count();
      const totalPages = Math.ceil(total / limitNum);

      const stats = await prisma.donation.aggregate({
        _sum: {
          amount: true,
        },
        _count: true,
      });

      return res.status(200).json({
        donations,
        pagination: {
          current: pageNum,
          total: totalPages,
          count: donations.length,
          total_items: total,
        },
        stats: {
          totalAmount: stats._sum.amount || 0,
          totalCount: stats._count,
        },
      });
    } catch (error) {
      console.error('Get donations error:', error);
      return res.status(500).json({ error: 'Error al obtener donaciones' });
    }
  }

  if (method === 'POST') {
    try {
      const session = await getSession(req, res);
      const { amount, message } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Monto inválido' });
      }

      const donation = await prisma.donation.create({
        data: {
          id: uuid(),
          userId: session?.user?.id || null,
          amount: parseFloat(amount),
          currency: 'MXN',
          message: message || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return res.status(201).json({ donation });
    } catch (error) {
      console.error('Create donation error:', error);
      return res.status(500).json({ error: 'Error al procesar donación' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
