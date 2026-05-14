import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchProfile();
      fetchFavorites();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile');
      const data = await res.json();
      setUser(data.user);
      setFormData({
        name: data.user.name,
        location: data.user.location || '',
        phone: data.user.phone || '',
        bio: data.user.bio || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/pets?limit=100');
      const data = await res.json();

      const favoriteRes = await fetch('/api/pets/favorites');
      const favData = await favoriteRes.json();
      const favPetIds = favData.favorites?.map((f) => f.petId) || [];

      const favPets = data.pets.filter((p) => favPetIds.includes(p.id));
      setFavorites(favPets);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setUpdating(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al actualizar perfil');
      } else {
        setUser(data.user);
        setMessage('Perfil actualizado exitosamente');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setMessage('');
    setUpdating(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/users/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al subir avatar');
      } else {
        setUser(data.user);
        setMessage('Avatar actualizado exitosamente');
        setAvatarFile(null);
      }
    } catch (error) {
      setError('Error de conexión');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setUpdating(true);

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al cambiar contraseña');
      } else {
        setMessage('Contraseña cambiada exitosamente');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      setError('Error de conexión');
      console.error(error);
    } finally {
      setUpdating(false);
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
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Mi Perfil</h1>

          <div className="bg-white rounded-lg shadow-lg">
            <div className="flex border-b">
              <button
                onClick={() => setTab('profile')}
                className={`flex-1 py-4 px-6 font-semibold ${
                  tab === 'profile'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600'
                }`}
              >
                Información General
              </button>
              <button
                onClick={() => setTab('password')}
                className={`flex-1 py-4 px-6 font-semibold ${
                  tab === 'password'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600'
                }`}
              >
                Cambiar Contraseña
              </button>
              <button
                onClick={() => setTab('favorites')}
                className={`flex-1 py-4 px-6 font-semibold ${
                  tab === 'favorites'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600'
                }`}
              >
                Favoritos ({favorites.length})
              </button>
            </div>

            <div className="p-6">
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

              {tab === 'profile' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="flex items-center gap-6">
                    <div>
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-3xl font-semibold">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto de Perfil
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={updating}
                        className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                      />
                      <p className="text-xs text-gray-500 mt-2">Máximo 5MB. JPG, PNG</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Tu ciudad"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biografía
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows="4"
                      placeholder="Cuéntanos sobre ti..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {updating ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </form>
                </div>
              )}

              {tab === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Mín. 8 caracteres, mayúscula, número"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {updating ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </button>
                </form>
              )}

              {tab === 'favorites' && (
                <div>
                  {favorites.length === 0 ? (
                    <EmptyState
                      icon="🤍"
                      title="Sin favoritos"
                      description="Aún no has marcado mascotas como favoritas"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favorites.map((pet) => (
                        <div
                          key={pet.id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                        >
                          {pet.image && (
                            <img
                              src={pet.image}
                              alt={pet.name}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-bold text-lg">{pet.name}</h3>
                            <p className="text-gray-600 text-sm">
                              {pet.breed} • {pet.species}
                            </p>
                            <button
                              onClick={() => router.push(`/pets/${pet.id}`)}
                              className="mt-4 w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary/90"
                            >
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
