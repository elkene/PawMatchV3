import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import PetGrid from '@/components/pets/PetGrid';
import PetFilters from '@/components/pets/PetFilters';
import Pagination from '@/components/shared/Pagination';
import PetDetailModal from '@/components/pets/PetDetailModal';

export default function Search() {
  const router = useRouter();
  const { data: session } = useSession();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
  });
  const [filters, setFilters] = useState({
    search: '',
    species: '',
    size: '',
    energy: '',
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchFavorites();
    }
  }, [session]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/pets/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites.map(f => f.petId));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchPets = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.species && { species: filters.species }),
        ...(filters.size && { size: filters.size }),
        ...(filters.energy && { energy: filters.energy }),
      });

      const res = await fetch(`/api/pets?${params}`);
      const data = await res.json();

      setPets(data.pets || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets(1);
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    fetchPets(newPage);
  };

  const handleFavorite = async (petId) => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    try {
      const isFavorite = favorites.includes(petId);
      const method = isFavorite ? 'DELETE' : 'POST';
      const res = await fetch(`/api/pets/${petId}/favorite`, { method });

      if (res.ok) {
        if (isFavorite) {
          setFavorites(favorites.filter(id => id !== petId));
        } else {
          setFavorites([...favorites, petId]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Adoptar</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <PetFilters onChange={handleFilterChange} />
            </div>

            <div className="lg:col-span-3">
              <PetGrid
                pets={pets}
                loading={loading}
                onPetDetail={setSelectedPet}
                onFavorite={handleFavorite}
                favorites={favorites}
              />

              {pets.length > 0 && (
                <div className="mt-8">
                  <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>

          {selectedPet && (
            <PetDetailModal
              pet={selectedPet}
              isFavorite={favorites.includes(selectedPet.id)}
              onFavorite={() => handleFavorite(selectedPet.id)}
              onClose={() => setSelectedPet(null)}
            />
          )}
        </div>
      </div>
  );
}
