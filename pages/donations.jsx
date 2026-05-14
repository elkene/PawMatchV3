import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Donations() {
  const { data: session } = useSession();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [stats, setStats] = useState({
    total: { amount: 0, count: 0 },
    last30Days: { amount: 0, count: 0 },
    byMonth: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/donations/stats');
      const data = await res.json();
      setStats({
        total: data.total || { amount: 0, count: 0 },
        last30Days: data.last30Days || { amount: 0, count: 0 },
        byMonth: data.byMonth || [],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage('');

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          message: message || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitMessage('¡Gracias por tu donación!');
        setAmount('');
        setMessage('');
        fetchStats();
      } else {
        setSubmitMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setSubmitMessage('Error al procesar donación');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 text-white">
            <h1 className="text-5xl font-bold mb-4">Apoya a PawMatch</h1>
            <p className="text-xl opacity-90">Tu donación ayuda a rescatar y cuidar animales en necesidad</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Hacer una Donación</h2>

              {submitMessage && (
                <div className={`p-4 rounded-lg mb-6 ${
                  submitMessage.includes('Gracias')
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monto (MXN)
                  </label>
                  <div className="flex gap-2 mb-3">
                    {[100, 250, 500, 1000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset.toString())}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          amount === preset.toString()
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Otro monto"
                    min="1"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensaje (Opcional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos por qué ayudas a PawMatch..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !amount}
                  className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Procesando...' : `Donar $${amount || '0'}`}
                </button>
              </form>

              <p className="text-xs text-gray-600 mt-4 text-center">
                Esta es una plataforma de prueba. Las donaciones son simuladas.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  Estadísticas Generales
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Total Recaudado</p>
                    <p className="text-3xl font-bold text-primary">
                      ${stats.total.amount?.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total de Donantes</p>
                    <p className="text-2xl font-bold">{stats.total.count}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-4">Últimos 30 Días</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Recaudado</p>
                    <p className="text-2xl font-bold text-primary">
                      ${stats.last30Days.amount?.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Donantes</p>
                    <p className="text-xl font-bold">{stats.last30Days.count}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Impacto de tu Donación</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-4xl mb-2">Alimento</p>
                <p className="font-semibold">$50</p>
                <p className="text-sm text-gray-600">Comida para 5 mascotas</p>
              </div>
              <div className="text-center">
                <p className="text-4xl mb-2">Medicina</p>
                <p className="font-semibold">$150</p>
                <p className="text-sm text-gray-600">Revisión veterinaria completa</p>
              </div>
              <div className="text-center">
                <p className="text-4xl mb-2">Refugio</p>
                <p className="font-semibold">$500</p>
                <p className="text-sm text-gray-600">Albergue seguro por un mes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
