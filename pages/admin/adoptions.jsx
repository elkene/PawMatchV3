import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminAdoptions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [adoptions, setAdoptions] = useState([]);
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchAdoptions();
    }
  }, [status]);

  const fetchAdoptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/adoptions?limit=100');
      const data = await res.json();
      let adoptionsData = data.adoptions || [];

      if (filter) {
        adoptionsData = adoptionsData.filter((a) => a.status === filter);
      }

      setAdoptions(adoptionsData);
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

  const handleStatusChange = async (adoptionId, newStatus) => {
    try {
      const res = await fetch(`/api/adoptions/${adoptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchAdoptions();
        if (selectedAdoption?.id === adoptionId) {
          handleSelectAdoption({ ...selectedAdoption, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating adoption:', error);
    }
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

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter) {
      const filtered = adoptions.filter((a) => a.status === newFilter);
      setAdoptions(filtered);
    } else {
      fetchAdoptions();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando adopciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Gestionar Adopciones</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Filtrar por Estado</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('')}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      !filter
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Todos ({adoptions.length})
                  </button>
                  {['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleFilterChange(status)}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        filter === status
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {status} (
                      {adoptions.filter((a) => a.status === status).length})
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {adoptions.map((adoption) => (
                  <div
                    key={adoption.id}
                    onClick={() => handleSelectAdoption(adoption)}
                    className={`bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition border-l-4 ${
                      adoption.status === 'APPROVED'
                        ? 'border-green-500'
                        : adoption.status === 'REJECTED'
                          ? 'border-red-500'
                          : adoption.status === 'COMPLETED'
                            ? 'border-blue-500'
                            : 'border-yellow-500'
                    } ${selectedAdoption?.id === adoption.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{adoption.user?.name}</h3>
                        <p className="text-gray-600">Solicita: {adoption.pet?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(adoption.createdAt).toLocaleDateString('es-MX')}
                        </p>
                      </div>
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
                ))}
              </div>
            </div>

            {selectedAdoption && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Detalles</h2>

                <div className="space-y-4 mb-6 pb-6 border-b">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Solicitante</label>
                    <p className="text-lg">{selectedAdoption.user?.name}</p>
                    <p className="text-sm text-gray-600">{selectedAdoption.user?.email}</p>
                    {selectedAdoption.user?.phone && (
                      <p className="text-sm text-gray-600">{selectedAdoption.user?.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Mascota</label>
                    <p className="text-lg">{selectedAdoption.pet?.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedAdoption.pet?.breed} • {selectedAdoption.pet?.species}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Estado</label>
                    <select
                      value={selectedAdoption.status}
                      onChange={(e) =>
                        handleStatusChange(selectedAdoption.id, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 font-semibold"
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="APPROVED">Aprobada</option>
                      <option value="REJECTED">Rechazada</option>
                      <option value="COMPLETED">Completada</option>
                    </select>
                  </div>

                  {selectedAdoption.message && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Mensaje</label>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {selectedAdoption.message}
                      </p>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-lg mb-3">Notas de Seguimiento</h3>

                {notesLoading ? (
                  <p className="text-gray-600">Cargando...</p>
                ) : (
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {notes.length === 0 ? (
                      <p className="text-gray-600 text-sm">Sin notas aún</p>
                    ) : (
                      notes.map((note) => (
                        <div
                          key={note.id}
                          className="bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-sm">{note.user?.name}</p>
                            <span className="text-xs px-2 py-1 bg-primary text-white rounded">
                              {note.user?.role === 'ADMIN' ? 'ADMIN' : 'Usuario'}
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
                    placeholder="Agregar nota..."
                    rows="2"
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
