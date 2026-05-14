import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminPets() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    size: '',
    energy: '',
    location: '',
    description: '',
    vaccinated: false,
    sterilized: false,
    microchip: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchPets();
    }
  }, [status]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pets?limit=100');
      const data = await res.json();
      setPets(data.pets || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      const url = editingPet ? `/api/pets/${editingPet.id}` : '/api/pets';
      const method = editingPet ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al guardar mascota');
      } else {
        setMessage(editingPet ? 'Mascota actualizada' : 'Mascota creada');
        fetchPets();
        resetForm();
      }
    } catch (error) {
      setError('Error de conexión');
      console.error(error);
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age.toString(),
      size: pet.size,
      energy: pet.energy,
      location: pet.location,
      description: pet.description || '',
      vaccinated: pet.vaccinated,
      sterilized: pet.sterilized,
      microchip: pet.microchip,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      try {
        const res = await fetch(`/api/pets/${id}`, { method: 'DELETE' });

        if (res.ok) {
          setMessage('Mascota eliminada');
          fetchPets();
        } else {
          setError('Error al eliminar mascota');
        }
      } catch (error) {
        setError('Error de conexión');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      species: '',
      breed: '',
      age: '',
      size: '',
      energy: '',
      location: '',
      description: '',
      vaccinated: false,
      sterilized: false,
      microchip: false,
    });
    setImageFile(null);
    setEditingPet(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando mascotas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Gestionar Mascotas</h1>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
            >
              {showForm ? 'Cancelar' : 'Nueva Mascota'}
            </button>
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
              <h2 className="text-2xl font-bold mb-6">
                {editingPet ? 'Editar Mascota' : 'Nueva Mascota'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Edad (años)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tamaño</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Seleccionar</option>
                    <option value="SMALL">Pequeño</option>
                    <option value="MEDIUM">Mediano</option>
                    <option value="LARGE">Grande</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Energía</label>
                  <select
                    value={formData.energy}
                    onChange={(e) => setFormData({ ...formData, energy: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Seleccionar</option>
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Moderada</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.vaccinated}
                    onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                    className="rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Vacunado</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sterilized}
                    onChange={(e) => setFormData({ ...formData, sterilized: e.target.checked })}
                    className="rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Esterilizado</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.microchip}
                    onChange={(e) => setFormData({ ...formData, microchip: e.target.checked })}
                    className="rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Microchip</label>
                </div>

                <div className="md:col-span-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90"
                  >
                    {editingPet ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Especie</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Raza</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Edad</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Tamaño</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Energía</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pets.map((pet) => (
                    <tr key={pet.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{pet.name}</td>
                      <td className="px-6 py-4">{pet.species}</td>
                      <td className="px-6 py-4">{pet.breed}</td>
                      <td className="px-6 py-4">{pet.age}</td>
                      <td className="px-6 py-4">{pet.size}</td>
                      <td className="px-6 py-4">{pet.energy}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(pet)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(pet.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-4">Total: {pets.length} mascotas</p>
        </div>
      </div>
  );
}
