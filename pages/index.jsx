import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import PetGrid from '@/components/pets/PetGrid';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function Home() {
  const { data: session } = useSession();
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPets();
  }, []);

  const fetchFeaturedPets = async () => {
    try {
      const res = await fetch('/api/pets?limit=6');
      const data = await res.json();
      setFeaturedPets(data.pets || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-6xl font-bold mb-4">PawMatch</h1>
            <p className="text-2xl mb-8">Encuentra tu mascota perfecta</p>
            <p className="text-lg mb-10 opacity-90">
              Conectando adoptantes con mascotas que necesitan un hogar amoroso
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/search"
                className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
              >
                Buscar Mascotas
              </Link>
              <Link
                href="/test"
                className="bg-secondary/80 text-white px-8 py-3 rounded-lg font-bold hover:bg-secondary transition"
              >
                Hacer Test de Compatibilidad
              </Link>
              <Link
                href="/donations"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition"
              >
                Donar
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">¿Cómo Funciona?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-5xl mb-4">1</p>
                <h3 className="text-xl font-bold mb-3">Busca</h3>
                <p className="text-gray-600">
                  Explora nuestro catálogo de mascotas disponibles para adopción
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-5xl mb-4">2</p>
                <h3 className="text-xl font-bold mb-3">Solicita</h3>
                <p className="text-gray-600">
                  Envía una solicitud de adopción para la mascota que te gustó
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-5xl mb-4">3</p>
                <h3 className="text-xl font-bold mb-3">Adopta</h3>
                <p className="text-gray-600">
                  Una vez aprobada, ¡lleva a tu nueva mascota a casa!
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Mascotas Destacadas</h2>

            {loading ? (
              <div className="flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <PetGrid pets={featuredPets} loading={false} />

                <div className="text-center mt-12">
                  <Link
                    href="/search"
                    className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition"
                  >
                    Ver Todas las Mascotas
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">100+</p>
              <p className="text-gray-600">Mascotas Rescatadas</p>
            </div>

            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">500+</p>
              <p className="text-gray-600">Adopciones Exitosas</p>
            </div>

            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">$50K</p>
              <p className="text-gray-600">Donado en Cuidados</p>
            </div>
          </div>
        </section>

        {!session && (
          <section className="bg-white py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">¿Listo para Adoptar?</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Crea una cuenta para solicitar mascotas y hacer seguimiento de tus adopciones
              </p>

              <div className="flex gap-4 justify-center">
                <Link
                  href="/auth/login"
                  className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
  );
}
