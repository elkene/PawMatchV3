import Image from 'next/image';

export default function PetCard({ pet, onDetail, onFavorite, isFavorite = false }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative h-48 bg-gray-200">
        {pet.image && (
          <img
            src={pet.image}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        )}
        <button
          onClick={() => onFavorite?.()}
          className={`absolute top-3 right-3 px-3 py-1 rounded text-sm font-semibold transition ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isFavorite ? 'En Favoritos' : 'Favorito'}
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{pet.name}</h3>

        <div className="text-sm text-gray-600 mb-3">
          <p>{pet.breed || 'Sin especificar'} • {pet.age} años</p>
          <p>{pet.size} • Energía: {pet.energy}</p>
        </div>

        <button
          onClick={() => onDetail?.()}
          className="w-full bg-primary text-white py-2 rounded hover:bg-secondary"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  );
}
