import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function PetDetailModal({ pet, isFavorite, onFavorite, onClose }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [adopting, setAdopting] = useState(false);

  const handleAdopt = async () => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    setAdopting(true);
    try {
      const res = await fetch('/api/adoptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: pet.id,
          message: `Quisiera adoptar a ${pet.name}`,
        }),
      });

      if (res.ok) {
        alert('Solicitud de adopción enviada correctamente');
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al enviar solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar solicitud');
    } finally {
      setAdopting(false);
    }
  };

  const images = pet.images ? (typeof pet.images === 'string' ? JSON.parse(pet.images) : pet.images) : [];
  const compatibility = pet.compatibility ? (typeof pet.compatibility === 'string' ? JSON.parse(pet.compatibility) : pet.compatibility) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{pet.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {images.length > 0 && (
            <div className="mb-6">
              <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-3">
                <img
                  src={images[0]}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${pet.name} ${idx + 2}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 text-sm">Especie</p>
              <p className="text-lg font-semibold">
                {pet.species === 'DOG' ? 'Perro' : pet.species === 'CAT' ? 'Gato' : pet.species === 'BIRD' ? 'Ave' : pet.species === 'RABBIT' ? 'Conejo' : pet.species}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Raza</p>
              <p className="text-lg font-semibold">{pet.breed || 'No especificada'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Edad</p>
              <p className="text-lg font-semibold">{pet.age} años</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Tamaño</p>
              <p className="text-lg font-semibold">
                {pet.size === 'SMALL' ? 'Pequeño' : pet.size === 'MEDIUM' ? 'Mediano' : 'Grande'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Energía</p>
              <p className="text-lg font-semibold">
                {pet.energy === 'LOW' ? 'Baja' : pet.energy === 'MEDIUM' ? 'Media' : 'Alta'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Ubicación</p>
              <p className="text-lg font-semibold">{pet.location}</p>
            </div>
          </div>

          {pet.description && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Descripción</h3>
              <p className="text-gray-700">{pet.description}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Vacunado</p>
              <p className="font-semibold">{pet.vaccinated ? 'Si' : 'No'}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Esterilizado</p>
              <p className="font-semibold">{pet.sterilized ? 'Si' : 'No'}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Microchip</p>
              <p className="font-semibold">{pet.microchip ? 'Si' : 'No'}</p>
            </div>
          </div>

          {compatibility && compatibility.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Compatibilidad</h3>
              <div className="flex flex-wrap gap-2">
                {compatibility.map((tag, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAdopt}
              disabled={adopting}
              className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {adopting ? 'Enviando...' : 'Solicitar Adopción'}
            </button>
            <button
              onClick={onFavorite}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                isFavorite
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
