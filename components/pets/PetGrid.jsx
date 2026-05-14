import PetCard from '@/components/pets/PetCard';
import EmptyState from '@/components/shared/EmptyState';

export default function PetGrid({ pets = [], loading = false, onPetDetail, onFavorite, favorites = [] }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (pets.length === 0) {
    return <EmptyState title="Sin mascotas" description="No hay mascotas disponibles con estos filtros" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pets.map((pet) => (
        <PetCard
          key={pet.id}
          pet={pet}
          onDetail={() => onPetDetail?.(pet)}
          onFavorite={() => onFavorite?.(pet.id)}
          isFavorite={favorites.includes(pet.id)}
        />
      ))}
    </div>
  );
}
