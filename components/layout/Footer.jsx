import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-secondary text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Acerca de</h3>
            <p className="text-sm text-gray-300">
              PawMatch es una plataforma para la adopción responsable de mascotas.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Enlaces</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li><Link href="/search" className="hover:text-white">Buscar mascotas</Link></li>
              <li><Link href="/test" className="hover:text-white">Test de compatibilidad</Link></li>
              <li><Link href="/donations" className="hover:text-white">Donar</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Contacto</h3>
            <p className="text-sm text-gray-300">
              Email: info@pawmatch.com
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2026 PawMatch. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
