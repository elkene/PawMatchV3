import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">401</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Autorizado</h2>
        <p className="text-gray-600 mb-8">Debes iniciar sesión para acceder a este contenido.</p>
        <Link
          href="/auth/login"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition"
        >
          Ir a Login
        </Link>
      </div>
    </div>
  );
}
