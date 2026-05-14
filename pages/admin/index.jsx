import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPets: 0,
    totalAdoptions: 0,
    totalDonations: 0,
    pendingAdoptions: 0,
  });
  const [donationStats, setDonationStats] = useState({
    total: { amount: 0, count: 0 },
    last30Days: { amount: 0, count: 0 },
    byMonth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [petsRes, adoptionsRes, donationsRes] = await Promise.all([
        fetch('/api/pets?limit=1'),
        fetch('/api/adoptions?limit=1'),
        fetch('/api/donations/stats'),
      ]);

      const petsData = await petsRes.json();
      const adoptionsData = await adoptionsRes.json();
      const donationsData = await donationsRes.json();

      setStats({
        totalPets: petsData.pagination?.total_items || 0,
        totalAdoptions: adoptionsData.pagination?.total_items || 0,
        totalDonations: donationsData.total.count || 0,
        pendingAdoptions: 0,
      });

      setDonationStats(donationsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Panel Administrativo</h1>
            <div className="space-x-2">
              <button
                onClick={() => router.push('/admin/pets')}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
              >
                Gestionar Mascotas
              </button>
              <button
                onClick={() => router.push('/admin/adoptions')}
                className="px-6 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90"
              >
                Gestionar Adopciones
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 font-semibold mb-2">Total de Mascotas</h3>
              <p className="text-4xl font-bold text-primary">{stats.totalPets}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 font-semibold mb-2">Solicitudes de Adopción</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.totalAdoptions}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 font-semibold mb-2">Total Donado</h3>
              <p className="text-4xl font-bold text-green-600">
                ${donationStats.total.amount?.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-gray-500">{stats.totalDonations} donantes</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 font-semibold mb-2">Últimos 30 Días</h3>
              <p className="text-2xl font-bold text-orange-600">
                ${donationStats.last30Days.amount?.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Donaciones por Mes</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={donationStats.byMonth ? [...donationStats.byMonth].reverse() : []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#FF6B35"
                    name="Total Recaudado (MXN)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Donantes por Mes</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={donationStats.byMonth ? [...donationStats.byMonth].reverse() : []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#004E89" name="Cantidad de Donantes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/admin/pets')}
                className="p-6 border-2 border-gray-200 rounded-lg text-center hover:border-primary hover:bg-gray-50 transition"
              >
                <p className="font-bold text-lg">Crear Mascota</p>
                <p className="text-sm text-gray-600">Agregar nueva mascota al sistema</p>
              </button>

              <button
                onClick={() => router.push('/admin/adoptions')}
                className="p-6 border-2 border-gray-200 rounded-lg text-center hover:border-primary hover:bg-gray-50 transition"
              >
                <p className="font-bold text-lg">Revisar Solicitudes</p>
                <p className="text-sm text-gray-600">Gestionar adopciones pendientes</p>
              </button>

              <button
                onClick={() => router.push('/search')}
                className="p-6 border-2 border-gray-200 rounded-lg text-center hover:border-primary hover:bg-gray-50 transition"
              >
                <p className="font-bold text-lg">Buscar Mascotas</p>
                <p className="text-sm text-gray-600">Ver catálogo completo</p>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
