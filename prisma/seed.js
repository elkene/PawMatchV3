import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.adoptionNote.deleteMany();
  await prisma.adoptionRequest.deleteMany();
  await prisma.petFavorite.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.lostPetReport.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  const admin = await prisma.user.create({
    data: {
      id: uuid(),
      email: 'admin@pawmatch.com',
      password: adminPassword,
      name: 'Admin PawMatch',
      role: 'ADMIN',
      location: 'Tijuana, BC',
      phone: '+52664123456',
      bio: 'Administrador de PawMatch',
    },
  });

  const user = await prisma.user.create({
    data: {
      id: uuid(),
      email: 'user@pawmatch.com',
      password: userPassword,
      name: 'Juan García',
      role: 'USER',
      location: 'Tijuana, BC',
      phone: '+52664987654',
      bio: 'Amante de los animales',
    },
  });

  console.log('✅ Usuarios creados:', { admin: admin.email, user: user.email });

  // Crear mascotas
  const pets = await Promise.all([
    prisma.pet.create({
      data: {
        id: uuid(),
        name: 'Luna',
        species: 'DOG',
        breed: 'Golden Retriever',
        age: 2,
        size: 'LARGE',
        energy: 'HIGH',
        location: 'Tijuana, Baja California',
        image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24',
        images: [
          'https://images.unsplash.com/photo-1633722715463-d30f4f325e24',
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
        ],
        description: 'Luna es una perrita muy cariñosa y juguetona que adora los paseos largos y jugar con otros perros.',
        compatibility: ['Familias con niños', 'Hogares activos', 'Jardín amplio'],
        vaccinated: true,
        sterilized: true,
        microchip: true,
      },
    }),
    prisma.pet.create({
      data: {
        id: uuid(),
        name: 'Max',
        species: 'CAT',
        breed: 'Siamés',
        age: 3,
        size: 'MEDIUM',
        energy: 'MEDIUM',
        location: 'Playas de Rosarito, BC',
        image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8',
        images: [
          'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8',
          'https://images.unsplash.com/photo-1574158622682-e40e69881006',
        ],
        description: 'Max es un gato elegante y conversador. Le encanta estar cerca de sus humanos.',
        compatibility: ['Hogares tranquilos', 'Adultos solteros', 'Parejas'],
        vaccinated: true,
        sterilized: true,
        microchip: true,
      },
    }),
    prisma.pet.create({
      data: {
        id: uuid(),
        name: 'Bella',
        species: 'DOG',
        breed: 'Labrador',
        age: 1,
        size: 'LARGE',
        energy: 'HIGH',
        location: 'Ensenada, BC',
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1',
        images: [
          'https://images.unsplash.com/photo-1601758228041-f3b2795255f1',
        ],
        description: 'Bella es una cachorra llena de energía que necesita una familia activa.',
        compatibility: ['Familias activas', 'Hogares con jardín', 'Personas deportistas'],
        vaccinated: true,
        sterilized: false,
        microchip: true,
      },
    }),
    prisma.pet.create({
      data: {
        id: uuid(),
        name: 'Milo',
        species: 'CAT',
        breed: 'Persa',
        age: 4,
        size: 'MEDIUM',
        energy: 'LOW',
        location: 'La Jolla, CA',
        image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e',
        images: [
          'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e',
          'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e',
        ],
        description: 'Milo es un gato tranquilo y elegante que disfruta de tomar siestas y ser mimado.',
        compatibility: ['Hogares tranquilos', 'Adultos mayores', 'Personas con paciencia'],
        vaccinated: true,
        sterilized: true,
        microchip: true,
      },
    }),
    prisma.pet.create({
      data: {
        id: uuid(),
        name: 'Rocky',
        species: 'DOG',
        breed: 'Pastor Alemán',
        age: 3,
        size: 'LARGE',
        energy: 'MEDIUM',
        location: 'Mexicali, BC',
        image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95',
        images: [
          'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95',
        ],
        description: 'Rocky es un perro inteligente y leal que necesita un dueño experimentado.',
        compatibility: ['Dueños experimentados', 'Hogares con espacio', 'Personas activas'],
        vaccinated: true,
        sterilized: true,
        microchip: true,
      },
    }),
    prisma.pet.create({
      data: {
        id: uuid(),
        name: 'Nieve',
        species: 'RABBIT',
        breed: 'Holandés',
        age: 1,
        size: 'SMALL',
        energy: 'LOW',
        location: 'Tecate, BC',
        image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fconejo.info%2Fwp-content%2Fuploads%2F2023%2F04%2Fconejos-blancos-1.jpg&f=1&nofb=1&ipt=56f72da467dfcf6f2e18872d5ab4edb4c7f18e3f52e01f53f6c139f6cbafb1a7',
        images: [
          'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fconejo.info%2Fwp-content%2Fuploads%2F2023%2F04%2Fconejos-blancos-1.jpg&f=1&nofb=1&ipt=56f72da467dfcf6f2e18872d5ab4edb4c7f18e3f52e01f53f6c139f6cbafb1a7',
          'https://images.unsplash.com/photo-1585288881260-611b8cd1ea5f',
        ],
        description: 'Nieve es un conejo dulce y sociable que disfruta de estar en compañía.',
        compatibility: ['Niños responsables', 'Hogares tranquilos', 'Cuidados básicos'],
        vaccinated: false,
        sterilized: false,
        microchip: false,
      },
    }),
  ]);

  console.log(`✅ ${pets.length} mascotas creadas`);

  // Crear donaciones
  const donations = await Promise.all([
    prisma.donation.create({
      data: {
        id: uuid(),
        userId: user.id,
        amount: 500,
        currency: 'MXN',
        message: 'Excelente trabajo',
      },
    }),
    prisma.donation.create({
      data: {
        id: uuid(),
        userId: null,
        amount: 1000,
        currency: 'MXN',
        message: null,
      },
    }),
  ]);

  console.log(`✅ ${donations.length} donaciones creadas`);

  console.log('✨ Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
