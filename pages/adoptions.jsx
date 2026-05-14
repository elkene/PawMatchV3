import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';

export default function Adoptions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchAdoptions(1);
    }
  }, [status]);

  const fetchAdoptions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/adoptions?page=${page}&limit=10`);
      const data = await res.json();
      setAdoptions(data.adoptions || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching adoptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (adoptionId) => {
    setNotesLoading(true);
    try {
      const res = await fetch(`/api/adoptions/${adoptionId}/notes`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSelectAdoption = (adoption) => {
    setSelectedAdoption(adoption);
    fetchNotes(adoption.id);
    setNewNote('');
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`/api/adoptions/${selectedAdoption.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotes([data.note, ...notes]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleStatusChange = async (adoptionId, newStatus) => {
    try {
      const res = await fetch(`/api/adoptions/${adoptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchAdoptions(pagination.current);
        if (selectedAdoption?.id === adoptionId) {
          handleSelectAdoption({ ...selectedAdoption, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating adoption:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Solicitudes de Adopción</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {adoptions.length === 0 ? (
                <EmptyState
                  icon="🏠"
                  title="Sin solicitudes"
                  description="Aún no has solicitado adoptar mascotas"
                />
              ) : (
                <div className="space-y-4">
                  {adoptions.map((adoption) => (
                    <div
                      key={adoption.id}
                      onClick={() => handleSelectAdoption(adoption)}
                      className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition ${
                        selectedAdoption?.id === adoption.id ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{adoption.pet?.name}</h3>
                          <p className="text-gray-600 text-sm">
                            {adoption.pet?.breed} • {adoption.pet?.species}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            Solicitado: {new Date(adoption.createdAt).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              adoption.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : adoption.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-700'
                                  : adoption.status === 'COMPLETED'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {adoption.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    onPageChange={fetchAdoptions}
                  />
                </div>
              )}
            </div>

            {selectedAdoption && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Detalles de Solicitud</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Mascota</label>
                    <p className="text-lg">{selectedAdoption.pet?.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Estado</label>
                    {session?.user?.role === 'ADMIN' ? (
                      <select
                        value={selectedAdoption.status}
                        onChange={(e) =>
                          handleStatusChange(selectedAdoption.id, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg p-2"
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="APPROVED">Aprobada</option>
                        <option value="REJECTED">Rechazada</option>
                        <option value="COMPLETED">Completada</option>
                      </select>
                    ) : (
                      <p className="text-lg">{selectedAdoption.status}</p>
                    )}
                  </div>

                  {selectedAdoption.message && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Mensaje</label>
                      <p className="text-sm text-gray-700">{selectedAdoption.message}</p>
                    </div>
                  )}
                </div>

                <hr className="my-6" />

                <h3 className="font-bold text-lg mb-4">Notas de Seguimiento</h3>

                {notesLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {notes.length === 0 ? (
                      <p className="text-gray-600 text-sm">Sin notas aún</p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-sm">{note.user?.name}</p>
                            <span className="text-xs text-gray-500">
                              {note.user?.role === 'ADMIN' ? '👨‍💼 Admin' : '👤 Usuario'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(note.createdAt).toLocaleString('es-MX')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Agregar una nota..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
                  >
                    Agregar Nota
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
