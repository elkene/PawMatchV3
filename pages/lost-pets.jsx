import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';

const LocationMap = dynamic(() => import('@/components/shared/LocationMap'), {
  ssr: false,
});

export default function LostPets() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    species: '',
    breed: '',
    lastSeenLocation: '',
    latitude: '',
    longitude: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchReports(1);
  }, [statusFilter]);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`/api/lost-pets?${params}`);
      const data = await res.json();
      setReports(data.reports || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = useCallback((location) => {
    setSelectedLocation(location);
    setFormData((prev) => ({
      ...prev,
      lastSeenLocation: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    if (!selectedLocation) {
      setError('Debes seleccionar una ubicación en el mapa');
      return;
    }

    setSubmitting(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    imageFiles.forEach((file) => {
      formDataToSend.append('images', file);
    });

    try {
      const res = await fetch('/api/lost-pets', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear reporte');
      } else {
        setMessage('Reporte creado exitosamente');
        setFormData({
          title: '',
          description: '',
          species: '',
          breed: '',
          lastSeenLocation: '',
          latitude: '',
          longitude: '',
          contactPhone: '',
          contactEmail: '',
        });
        setImageFiles([]);
        setSelectedLocation(null);
        setShowForm(false);
        fetchReports(1);
      }
    } catch (error) {
      setError('Error de conexión');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReport = async (reportId) => {
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/lost-pets/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al actualizar reporte');
      } else {
        setMessage('Reporte actualizado exitosamente');
        setEditingId(null);
        setEditFormData({});
        fetchReports(1);
      }
    } catch (error) {
      setError('Error de conexión');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignHelper = async (reportId) => {
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/lost-pets/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helperId: session.user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al asignarse');
      } else {
        setMessage('Te has asignado como ayudante');
        fetchReports(1);
      }
    } catch (error) {
      setError('Error de conexión');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeStatus = async (reportId, newStatus) => {
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/lost-pets/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al cambiar estado');
      } else {
        setMessage('Estado actualizado');
        fetchReports(1);
      }
    } catch (error) {
      setError('Error de conexión');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Reportes</h1>
            {session && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
              >
                {showForm ? 'Cancelar' : 'Reportar Mascota Perdida'}
              </button>
            )}
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Reportar Mascota Perdida</h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Perro blanco perdido en el Centro"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Especie</label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Seleccionar</option>
                    <option value="DOG">Perro</option>
                    <option value="CAT">Gato</option>
                    <option value="RABBIT">Conejo</option>
                    <option value="BIRD">Ave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Raza</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lugar Último Avistamiento
                  </label>
                  <LocationMap onLocationSelect={handleLocationSelect} initialLocation={selectedLocation} />
                  <input
                    type="text"
                    value={formData.lastSeenLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, lastSeenLocation: e.target.value })
                    }
                    placeholder="Ubicación seleccionada en el mapa"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-3"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Características, comportamiento, etc."
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fotos (máx 5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {imageFiles.length} archivo(s) seleccionado(s)
                  </p>
                </div>

                <div className="md:col-span-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {submitting ? 'Creando...' : 'Crear Reporte'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Filtrar por Estado</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  !statusFilter
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Todos
              </button>
              {['LOST', 'FOUND', 'RESOLVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    statusFilter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {status === 'LOST' ? 'Perdida' : status === 'FOUND' ? 'Encontrada' : 'Resuelta'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : reports.length === 0 ? (
            <EmptyState
              title="Sin reportes"
              description="No hay reportes de mascotas perdidas en este momento"
            />
          ) : (
            <>
              <div className="space-y-6 mb-8">
                {reports.map((report) => {
                  const isCreator = session?.user?.id === report.user.id;
                  const isHelper = session?.user?.id === report.helperId;

                  return (
                    <div key={report.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      {editingId === report.id ? (
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-4">Editar Reporte</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
                              <input
                                type="text"
                                value={editFormData.title || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                              <textarea
                                value={editFormData.description || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                rows="3"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Especie</label>
                              <select
                                value={editFormData.species || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, species: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              >
                                <option value="">Seleccionar</option>
                                <option value="DOG">Perro</option>
                                <option value="CAT">Gato</option>
                                <option value="RABBIT">Conejo</option>
                                <option value="BIRD">Ave</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Raza</label>
                              <input
                                type="text"
                                value={editFormData.breed || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación</label>
                              <input
                                type="text"
                                value={editFormData.lastSeenLocation || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, lastSeenLocation: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                              <input
                                type="tel"
                                value={editFormData.contactPhone || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={editFormData.contactEmail || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, contactEmail: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleEditReport(report.id)}
                                disabled={submitting}
                                className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                              >
                                {submitting ? 'Guardando...' : 'Guardar'}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {report.images && Array.isArray(report.images) && report.images.length > 0 && (
                            <img
                              src={report.images[0]}
                              alt={report.title}
                              className="w-full h-48 object-cover"
                            />
                          )}

                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-bold text-lg">{report.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">Por: {report.user.name}</p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  report.status === 'LOST'
                                    ? 'bg-red-100 text-red-700'
                                    : report.status === 'FOUND'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {report.status === 'LOST' ? 'Perdida' : report.status === 'FOUND' ? 'Encontrada' : 'Resuelta'}
                              </span>
                            </div>

                            <p className="text-gray-600 text-sm mb-2">
                              {report.species} {report.breed && `(${report.breed})`}
                            </p>

                            {report.description && (
                              <p className="text-gray-700 text-sm mb-3">{report.description}</p>
                            )}

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                              <p>Ubicación: {report.lastSeenLocation}</p>
                              <p>Teléfono: {report.contactPhone}</p>
                              <p>Email: {report.contactEmail}</p>
                              {report.helperId && (
                                <p className="text-blue-600 font-semibold">Ayudante asignado</p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {isCreator && (
                                <button
                                  onClick={() => {
                                    setEditingId(report.id);
                                    setEditFormData(report);
                                  }}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                                >
                                  Editar
                                </button>
                              )}

                              {!isHelper && !isCreator && (
                                <button
                                  onClick={() => handleAssignHelper(report.id)}
                                  disabled={submitting}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm disabled:opacity-50"
                                >
                                  {submitting ? 'Asignando...' : 'Ayudar'}
                                </button>
                              )}

                              {isHelper && (
                                <div className="flex gap-1 w-full">
                                  <select
                                    value={report.status}
                                    onChange={(e) => handleChangeStatus(report.id, e.target.value)}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                                  >
                                    <option value="LOST">Perdida</option>
                                    <option value="FOUND">Encontrada</option>
                                    <option value="RESOLVED">Resuelta</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {pagination.total > 1 && (
                <Pagination
                  current={pagination.current}
                  total={pagination.total}
                  onPageChange={fetchReports}
                />
              )}
            </>
          )}
        </div>
      </div>
  );
}
