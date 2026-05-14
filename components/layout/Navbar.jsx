import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {session?.user && (
              session.user.avatar ? (
                <img
                  src={session.user.avatar}
                  alt={session.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
              )
            )}
            <Link href="/" className="text-2xl font-bold text-primary">
              PawMatch
            </Link>
          </div>
          <div className="flex gap-6 items-center">
            {session ? (
              <>
                <Link href="/search" className="hover:text-primary">Adoptar</Link>
                <Link href="/test" className="hover:text-primary">Test</Link>
                <Link href="/lost-pets" className="hover:text-primary">Reportes</Link>
                <Link href="/adoptions" className="hover:text-primary">Mis Adopciones</Link>
                <Link href="/donations" className="hover:text-primary">Donar</Link>
                <Link href="/profile" className="hover:text-primary">Perfil</Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-secondary font-bold hover:text-primary">Admin</Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/search" className="hover:text-primary">Adoptar</Link>
                <Link href="/test" className="hover:text-primary">Test</Link>
                <Link href="/lost-pets" className="hover:text-primary">Reportes</Link>
                <Link href="/auth/login" className="hover:text-primary">Login</Link>
                <Link href="/auth/register" className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
