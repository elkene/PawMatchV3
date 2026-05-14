import { useState } from 'react';

const SPECIES_OPTIONS = [
  { value: 'DOG', label: 'Perro' },
  { value: 'CAT', label: 'Gato' },
  { value: 'BIRD', label: 'Ave' },
  { value: 'RABBIT', label: 'Conejo' },
];

const SIZE_OPTIONS = [
  { value: 'SMALL', label: 'Pequeño' },
  { value: 'MEDIUM', label: 'Mediano' },
  { value: 'LARGE', label: 'Grande' },
];

const ENERGY_OPTIONS = [
  { value: 'LOW', label: 'Bajo' },
  { value: 'MEDIUM', label: 'Medio' },
  { value: 'HIGH', label: 'Alto' },
];

export default function PetFilters({ onFilter }) {
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const [size, setSize] = useState('');
  const [energy, setEnergy] = useState('');

  const handleApplyFilters = () => {
    onFilter?.({
      search: search || undefined,
      species: species || undefined,
      size: size || undefined,
      energy: energy || undefined,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Filtros</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre o raza..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Especie</label>
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">Cualquiera</option>
            {SPECIES_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Tamaño</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">Cualquiera</option>
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Energía</label>
          <select
            value={energy}
            onChange={(e) => setEnergy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">Cualquiera</option>
            {ENERGY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleApplyFilters}
          className="w-full bg-primary text-white py-2 rounded hover:bg-secondary"
        >
          Filtrar
        </button>
      </div>
    </div>
  );
}
