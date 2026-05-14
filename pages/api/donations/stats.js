import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const allDonations = await prisma.donation.findMany();

    const totalAmount = allDonations.reduce((sum, d) => {
      const amount = typeof d.amount === 'object' ? parseFloat(d.amount.toString()) : parseFloat(d.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last30Donations = allDonations.filter(d => new Date(d.createdAt) >= last30Days);
    const last30Amount = last30Donations.reduce((sum, d) => {
      const amount = typeof d.amount === 'object' ? parseFloat(d.amount.toString()) : parseFloat(d.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const byMonthMap = {};
    allDonations.forEach((d) => {
      const date = new Date(d.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonthMap[monthKey]) {
        byMonthMap[monthKey] = { month: monthKey, count: 0, total: 0 };
      }
      const amount = typeof d.amount === 'object' ? parseFloat(d.amount.toString()) : parseFloat(d.amount);
      byMonthMap[monthKey].count += 1;
      byMonthMap[monthKey].total += isNaN(amount) ? 0 : amount;
    });

    const byMonth = Object.values(byMonthMap).sort((a, b) => b.month.localeCompare(a.month));

    return res.status(200).json({
      total: {
        amount: totalAmount,
        count: allDonations.length,
      },
      last30Days: {
        amount: last30Amount,
        count: last30Donations.length,
      },
      byMonth,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}
