# PawMatch V3 - Stack Completo Explicado

## 📑 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Frontend](#frontend)
3. [Backend](#backend)
4. [Base de Datos](#base-de-datos)
5. [Autenticación](#autenticación)
6. [Almacenamiento de Archivos](#almacenamiento-de-archivos)
7. [Herramientas y Librerías](#herramientas-y-librerías)
8. [Deployment](#deployment)
9. [Flujo de Datos](#flujo-de-datos)
10. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Visión General

PawMatch V3 es una **aplicación web fullstack** construida con tecnologías modernas de JavaScript. La arquitectura separa claramente el frontend (lo que ve el usuario) del backend (la lógica de negocio y datos).

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React + Next.js (Pages Router)                  │   │
│  │  - Interfaz de usuario                           │   │
│  │  - Gestión de sesión                             │   │
│  │  - Llamadas HTTP al backend                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↕
                    HTTP/HTTPS (REST API)
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    SERVIDOR (Node.js)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Next.js API Routes                              │   │
│  │  - Validación de datos                           │   │
│  │  - Lógica de negocio                             │   │
│  │  - Autenticación                                 │   │
│  │  - Conexión a BD                                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↕
                      Prisma ORM
                            ↕
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (MySQL 8.0)                  │
│  - Usuarios, mascotas, adopciones, reportes, etc.      │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend

### 1. **Next.js 14 (Pages Router)**

#### ¿Qué es?
Next.js es un **framework de React** que facilita la construcción de aplicaciones web. El "Pages Router" significa que usamos el sistema de carpetas `pages/` para definir rutas.

#### Cómo funciona en PawMatch:
```
pages/
├── index.jsx                 → GET / (Home)
├── search.jsx               → GET /search (Buscar mascotas)
├── profile.jsx              → GET /profile (Mi perfil)
├── auth/
│   ├── login.jsx           → GET /auth/login
│   └── register.jsx        → GET /auth/register
└── api/
    └── pets/[id].js        → GET/PUT/DELETE /api/pets/[id]
```

#### Características principales:
- **Server-Side Rendering (SSR)**: Genera HTML en el servidor
- **Static Generation (SSG)**: Pre-genera páginas en build time
- **API Routes**: Endpoints `/api/*` se crean automáticamente
- **Image Optimization**: Optimiza imágenes automáticamente
- **Middleware**: Protege rutas antes de que se carguen

#### Ejemplo de página:
```jsx
// pages/profile.jsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Profile() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch datos del usuario
    fetch('/api/users/profile')
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  return (
    <div>
      <h1>Mi Perfil</h1>
      {user && <p>Hola, {user.name}</p>}
    </div>
  );
}
```

---

### 2. **React**

#### ¿Qué es?
React es una **librería JavaScript** que permite crear interfaces de usuario interactivas usando componentes.

#### Conceptos clave:
- **Componentes**: Piezas reutilizables de UI (ej: `PetCard.jsx`)
- **Estado (State)**: Variables que pueden cambiar y actualizar la UI
- **Props**: Parámetros que pasamos a componentes
- **Hooks**: Funciones para gestionar estado (`useState`, `useEffect`, etc.)

#### Ejemplo:
```jsx
// components/pets/PetCard.jsx
export default function PetCard({ pet, onFavorite }) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = () => {
    fetch(`/api/pets/${pet.id}/favorite`, { method: 'POST' })
      .then(res => {
        if (res.ok) {
          setIsFavorited(true);
          onFavorite(pet.id);
        }
      });
  };

  return (
    <div className="pet-card">
      <img src={pet.image} alt={pet.name} />
      <h3>{pet.name}</h3>
      <button onClick={handleFavorite}>
        {isFavorited ? 'En Favoritos' : 'Favorito'}
      </button>
    </div>
  );
}
```

---

### 3. **Tailwind CSS**

#### ¿Qué es?
Tailwind CSS es un **framework CSS utilitario** que proporciona clases predefinidas para estilos.

#### Cómo se usa:
```jsx
<div className="bg-white rounded-lg shadow-lg p-6">
  <h1 className="text-2xl font-bold text-primary mb-4">
    Título
  </h1>
  <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
    Botón
  </button>
</div>
```

#### Clases comunes en PawMatch:
- `bg-white` = fondo blanco
- `text-primary` = color de texto primario (azul)
- `rounded-lg` = bordes redondeados
- `shadow-lg` = sombra grande
- `px-4 py-2` = padding horizontal 4, vertical 2
- `hover:bg-primary/90` = cambiar fondo al pasar el mouse

---

### 4. **shadcn/ui**

#### ¿Qué es?
shadcn/ui es una **librería de componentes reutilizables** que se copian a tu proyecto y se personalizan.

#### Componentes usados en PawMatch:
- `Button` - Botones
- `Card` - Tarjetas
- `Dialog` - Modales
- `Input` - Campos de texto
- `Select` - Desplegables
- `Badge` - Etiquetas

#### Ejemplo:
```jsx
import { Button } from '@/components/ui/button';

export default function MyComponent() {
  return (
    <Button onClick={() => console.log('Click!')}>
      Haz clic
    </Button>
  );
}
```

---

## Backend

### 1. **Next.js API Routes**

#### ¿Qué son?
Son endpoints HTTP que se crean automáticamente en `pages/api/`. Actúan como tu servidor backend.

#### Estructura:
```
pages/api/
├── pets/
│   ├── index.js              → GET /api/pets (listar)
│   │                         → POST /api/pets (crear)
│   ├── [id].js               → GET /api/pets/:id
│   │                         → PUT /api/pets/:id (editar)
│   │                         → DELETE /api/pets/:id
│   └── [id]/favorite.js      → POST /api/pets/:id/favorite
└── users/
    ├── profile.js            → GET /api/users/profile
    ├── upload-avatar.js      → POST /api/users/upload-avatar
    └── change-password.js    → POST /api/users/change-password
```

#### Ejemplo de API Route:
```javascript
// pages/api/pets/[id].js
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-helpers';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  // GET /api/pets/123
  if (method === 'GET') {
    try {
      const pet = await prisma.pet.findUnique({
        where: { id },
      });
      return res.status(200).json({ pet });
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener mascota' });
    }
  }

  // PUT /api/pets/123
  if (method === 'PUT') {
    const session = await getSession(req, res);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    try {
      const { name, description } = req.body;
      const pet = await prisma.pet.update({
        where: { id },
        data: { name, description },
      });
      return res.status(200).json({ pet });
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar' });
    }
  }

  // DELETE /api/pets/123
  if (method === 'DELETE') {
    const session = await getSession(req, res);
    if (session?.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    try {
      await prisma.pet.delete({ where: { id } });
      return res.status(200).json({ message: 'Eliminado' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

#### Métodos HTTP:
- `GET` - Obtener datos
- `POST` - Crear nuevos datos
- `PUT` - Actualizar datos existentes
- `DELETE` - Eliminar datos

---

### 2. **Validación y Lógica**

#### Validaciones en el backend:
```javascript
// Validar que el usuario existe
if (!session?.user?.id) {
  return res.status(401).json({ error: 'No autenticado' });
}

// Validar permisos
if (session.user.role !== 'ADMIN') {
  return res.status(403).json({ error: 'No autorizado' });
}

// Validar que la mascota existe
if (!pet) {
  return res.status(404).json({ error: 'Mascota no encontrada' });
}

// Validar estados válidos
const validStatuses = ['LOST', 'FOUND', 'RESOLVED'];
if (!validStatuses.includes(status)) {
  return res.status(400).json({ error: 'Estado inválido' });
}
```

#### Códigos HTTP comunes:
- `200` - OK (éxito)
- `201` - Created (recurso creado)
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (no autenticado)
- `403` - Forbidden (sin permiso)
- `404` - Not Found (no existe)
- `500` - Server Error (error en el servidor)

---

## Base de Datos

### 1. **MySQL 8.0**

#### ¿Qué es?
MySQL es una **base de datos relacional** que almacena todos los datos de PawMatch en tablas.

#### Tablas principales:
```
users (Usuarios)
├── id (UUID único)
├── email (correo, único)
├── password (hash bcryptjs)
├── name (nombre)
├── role (USER o ADMIN)
├── avatar (ruta a foto de perfil)
├── location (ubicación)
├── phone (teléfono)
├── bio (biografía)
└── createdAt, updatedAt (timestamps)

pets (Mascotas)
├── id
├── name
├── species (DOG, CAT, RABBIT, etc.)
├── breed (raza)
├── age
├── size (SMALL, MEDIUM, LARGE)
├── energy (LOW, MEDIUM, HIGH)
├── image (URL principal)
├── images (array JSON de URLs)
├── description (descripción larga)
├── vaccinated, sterilized, microchip (booleans)
└── available (booleano)

adoptionRequests (Solicitudes de adopción)
├── id
├── userId (FK a users)
├── petId (FK a pets)
├── status (PENDING, APPROVED, REJECTED, COMPLETED)
├── message (mensaje del usuario)
└── Unique constraint: [userId, petId]

petFavorites (Favoritos)
├── id
├── userId (FK a users)
├── petId (FK a pets)
└── Unique constraint: [userId, petId]

lostPetReports (Reportes de mascotas perdidas)
├── id
├── userId (FK a users - quien reportó)
├── helperId (FK a users - quien ayuda, opcional)
├── title
├── description
├── species
├── breed
├── lastSeenLocation
├── latitude, longitude
├── status (LOST, FOUND, RESOLVED)
├── images (array JSON de URLs)
└── contactPhone, contactEmail

donations (Donaciones)
├── id
├── userId (FK a users, opcional)
├── amount (decimal)
├── currency (MXN)
├── message
└── createdAt
```

---

### 2. **Prisma ORM**

#### ¿Qué es?
Prisma es un **ORM (Object-Relational Mapping)** que te permite interactuar con la BD usando JavaScript en lugar de SQL directo.

#### Ventajas:
- No escribes SQL directo
- Tipos automáticos (TypeScript)
- Migraciones automáticas
- Validación de datos

#### Ejemplos:

**Sin Prisma (SQL directo):**
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

**Con Prisma:**
```javascript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
});
```

---

#### Operaciones comunes:

**CREATE (crear)**
```javascript
const newPet = await prisma.pet.create({
  data: {
    name: 'Luna',
    species: 'DOG',
    breed: 'Golden Retriever',
    age: 2,
    size: 'LARGE',
    energy: 'HIGH',
  },
});
```

**READ (leer)**
```javascript
// Uno
const pet = await prisma.pet.findUnique({
  where: { id: '123' },
});

// Múltiples
const pets = await prisma.pet.findMany({
  where: { species: 'DOG' },
  take: 10,
  orderBy: { createdAt: 'desc' },
});
```

**UPDATE (actualizar)**
```javascript
const updated = await prisma.pet.update({
  where: { id: '123' },
  data: {
    name: 'Luna Updated',
    age: 3,
  },
});
```

**DELETE (eliminar)**
```javascript
await prisma.pet.delete({
  where: { id: '123' },
});
```

---

#### Relaciones (Joins):

**Obtener usuario con todos sus favoritos:**
```javascript
const user = await prisma.user.findUnique({
  where: { id: 'user-123' },
  include: {
    favorites: {
      include: { pet: true }, // También obtener detalles de la mascota
    },
  },
});
```

---

### 3. **Índices y Búsqueda**

#### FULLTEXT Search (Búsqueda de texto completo):
```javascript
// En schema.prisma:
model Pet {
  ...
  @@fulltext([name, breed, description])
}

// En código:
const results = await prisma.$queryRaw`
  SELECT * FROM pets 
  WHERE MATCH(name, breed, description) 
  AGAINST(${searchTerm} IN BOOLEAN MODE)
  LIMIT 10
`;
```

---

## Autenticación

### 1. **NextAuth.js v4**

#### ¿Qué es?
NextAuth.js es una librería que maneja **autenticación y sesiones** automáticamente.

#### Flujo de autenticación en PawMatch:

```
Usuario entra a login
         ↓
Ingresa email y contraseña
         ↓
POST /api/auth/signin
         ↓
NextAuth verifica credenciales (lib/auth.js)
         ↓
¿Contraseña válida? (bcryptjs.compare)
         ↓
Sí → Genera JWT token
     ↓
     Crea sesión (cookie segura)
     ↓
     Redirige a /
         
No → Error "Credenciales inválidas"
```

#### Configuración (lib/auth.js):
```javascript
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error('Credenciales inválidas');

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) throw new Error('Credenciales inválidas');

        // Retornar usuario autenticado
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' }, // Usar JWT (no sesiones de BD)

  callbacks: {
    // Agregar datos al token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },

    // Agregar datos a la sesión accesible en el cliente
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.avatar = token.avatar;
      return session;
    },
  },
};
```

---

### 2. **Uso de Sesiones en Componentes**

#### Frontend:
```javascript
import { useSession, signOut } from 'next-auth/react';

export default function Profile() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Cargando...</p>;
  if (status === 'unauthenticated') return <p>No autorizado</p>;

  return (
    <div>
      <p>Hola, {session.user.name}</p>
      <p>Email: {session.user.email}</p>
      <p>Rol: {session.user.role}</p>
      {session.user.avatar && (
        <img src={session.user.avatar} alt="Avatar" />
      )}
      <button onClick={() => signOut()}>Salir</button>
    </div>
  );
}
```

#### Backend (API Routes):
```javascript
import { getSession } from '@/lib/api-helpers';

export default async function handler(req, res) {
  const session = await getSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  // Verificar rol
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo admins' });
  }

  // Usuario autenticado y autorizado
  return res.json({ user: session.user });
}
```

---

### 3. **Middleware (Protección de Rutas)**

#### middleware.js:
```javascript
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  // Middleware personalizado
  function middleware(req) {
    // Token disponible en req.nextauth.token
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Redirige si no hay token
    },
  }
);

export const config = {
  matcher: [
    // Proteger estas rutas
    '/profile',
    '/adoptions',
    '/admin/:path*',
  ],
};
```

---

### 4. **bcryptjs (Hash de Contraseña)**

#### ¿Por qué no guardar contraseñas en texto plano?
❌ Si alguien accede a la BD, tiene todas las contraseñas
✅ El hash hace irreversible la contraseña

#### Cómo funciona:
```javascript
import bcrypt from 'bcryptjs';

// Registrar usuario
const plainPassword = 'MiPassword123';
const hashed = await bcrypt.hash(plainPassword, 10);
// hashed = $2b$10$NRh/7ND0v2hxTUlSWDVYGO...

// Guardar 'hashed' en BD, NO 'plainPassword'
await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashed, // Hash, no plain text
  },
});

// Login: comparar contraseña ingresada con hash
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
});

const isValid = await bcrypt.compare('MiPassword123', user.password);
// isValid = true si las contraseñas coinciden
```

#### Compatibilidad con PHP:
PHP y Node.js usan el mismo algoritmo bcrypt, así que los hashes de PHP funcionan con bcryptjs de Node.

---

## Almacenamiento de Archivos

### 1. **Multer (Upload de Archivos)**

#### ¿Qué es?
Multer es un middleware que procesa uploads de archivos.

#### Configuración:
```javascript
// pages/api/users/upload-avatar.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');

// Crear directorio si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: uploadDir, // Dónde guardar
  filename: (req, file, cb) => {
    // Nombre único para el archivo
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5MB
});

export const config = {
  api: { bodyParser: false }, // Dejar que multer procese el cuerpo
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST' });
  }

  const uploadMiddleware = upload.single('avatar');

  return uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error al subir archivo' });
    }

    // req.file tiene información del archivo subido
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Guardar ruta en BD
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarPath },
    });

    return res.json({ user });
  });
}
```

#### Uso desde el frontend:
```javascript
const handleAvatarUpload = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file); // 'avatar' debe coincidir con .single('avatar')

  const res = await fetch('/api/users/upload-avatar', {
    method: 'POST',
    body: formData, // FormData, NO JSON
  });

  const data = await res.json();
  return data.user;
};
```

---

### 2. **Estructura de Directorios**

```
public/uploads/
├── pets/              # Imágenes de mascotas (admin)
│   └── 1684256789-abc123.jpg
├── lost-pets/         # Imágenes de reportes perdidos
│   └── 1684256850-def456.jpg
└── avatars/           # Fotos de perfil de usuarios
    └── 1684256900-ghi789.jpg
```

#### Servir archivos estáticos:
Next.js sirve automáticamente `/public/*` como `/url-publica`

```javascript
// Guardar en:
// public/uploads/avatars/1684256900-ghi789.jpg

// Acceder como:
// <img src="/uploads/avatars/1684256900-ghi789.jpg" />
```

---

## Herramientas y Librerías

### 1. **Dependencias Principales**

```json
{
  "dependencies": {
    "next": "14.0.0",              // Framework web
    "react": "18.x",               // UI library
    "next-auth": "4.x",            // Autenticación
    "prisma": "5.x",               // ORM
    "@prisma/client": "5.x",       // Cliente Prisma
    "bcryptjs": "2.4.3",           // Hash de contraseñas
    "multer": "1.4.5-lts.1",       // Upload de archivos
    "nodemailer": "6.x",           // Email
    "tailwindcss": "3.x",          // CSS framework
    "recharts": "2.x",             // Gráficas
    "uuid": "9.x",                 // IDs únicos
    "leaflet": "1.9.x"             // Mapas
  }
}
```

---

### 2. **Recharts (Gráficas)**

#### Ejemplo de gráfica de donaciones:
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { month: 'Enero', donations: 500 },
  { month: 'Febrero', donations: 800 },
  { month: 'Marzo', donations: 1200 },
];

export default function DonationChart() {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="donations" stroke="#8884d8" />
    </LineChart>
  );
}
```

---

### 3. **Leaflet (Mapas)**

#### Uso para seleccionar ubicación:
```javascript
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LocationMap({ onLocationSelect }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Crear mapa
    map.current = L.map(mapContainer.current).setView([25.6866, -100.3161], 13);

    // Agregar tiles (mapas)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map.current);

    // Manejar clicks
    map.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });

      // Agregar marcador
      L.marker([lat, lng]).addTo(map.current);
    });
  }, []);

  return <div ref={mapContainer} className="w-full h-96" />;
}
```

---

### 4. **UUID (IDs únicos)**

#### Por qué no usar IDs secuenciales:
```javascript
// ❌ Malo: IDs secuenciales
id: 1, 2, 3, 4...
// - Predecibles
// - Personas pueden adivinar IDs de otros

// ✅ Bueno: UUIDs
import { v4 as uuid } from 'uuid';
const id = uuid(); // "550e8400-e29b-41d4-a716-446655440000"
// - Imposibles de adivinar
// - Únicos en cualquier sistema
```

#### Uso en Prisma:
```javascript
const user = await prisma.user.create({
  data: {
    id: uuid(), // ID único automático
    email: 'user@example.com',
    ...
  },
});
```

---

### 5. **Nodemailer (Emails)**

#### Configuración (lib/email.js):
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // smtp.gmail.com
  port: process.env.SMTP_PORT,      // 587
  secure: false,                     // true para 465, false para otros
  auth: {
    user: process.env.SMTP_USER,    // tu-email@gmail.com
    pass: process.env.SMTP_PASS,    // tu-app-password
  },
});

export async function sendPasswordResetEmail(email, resetLink) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,    // "PawMatch <noreply@pawmatch.com>"
    to: email,
    subject: 'Recuperar contraseña - PawMatch',
    html: `
      <h1>Recuperar Contraseña</h1>
      <p>Haz clic aquí para restablecer tu contraseña:</p>
      <a href="${resetLink}">Restablecer Contraseña</a>
      <p>Este enlace expira en 1 hora.</p>
    `,
  });
}
```

#### Uso:
```javascript
// pages/api/users/forgot-password.js
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

await prisma.passwordResetToken.create({
  data: {
    userId: user.id,
    token: resetTokenHash,
    expiresAt: new Date(Date.now() + 3600000), // 1 hora
  },
});

const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
await sendPasswordResetEmail(user.email, resetLink);
```

---

## Deployment

### 1. **Docker**

#### ¿Qué es Docker?
Docker **empaqueta toda tu aplicación** (código, dependencias, BD) en un contenedor que funciona igual en cualquier servidor.

#### Dockerfile (Construcción multietapa):
```dockerfile
# Stage 1: Instalar dependencias
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: Compilar la aplicación
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Producción (imagen final mínima)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

#### docker-compose.yml:
```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_pass
      MYSQL_DATABASE: pawmatch_db
      MYSQL_USER: pawmatch_user
      MYSQL_PASSWORD: pawmatch_pass
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "mysql://pawmatch_user:pawmatch_pass@db:3306/pawmatch_db"
      NEXTAUTH_URL: "http://localhost:3000"
      NEXTAUTH_SECRET: "your-secret-key"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./public/uploads:/app/public/uploads

volumes:
  mysql_data:
```

#### Comandos:
```bash
# Construir y ejecutar
docker-compose up --build

# Solo ejecutar (sin rebuild)
docker-compose up

# Detener
docker-compose down

# Ver logs
docker-compose logs -f app
```

---

### 2. **Proceso de Deployment**

```
1. Desarrollador hace commit
   ↓
2. Push a GitHub
   ↓
3. CI/CD pipeline (opcional)
   - Correr tests
   - Construir Docker image
   ↓
4. Subir imagen a registro (Docker Hub, AWS ECR)
   ↓
5. Servidor de producción descarga imagen
   ↓
6. docker-compose up ejecuta app + DB
   ↓
7. Primero corre DB
   ↓
8. Luego corre app (espera a que DB esté lista)
   ↓
9. App ejecuta migraciones de Prisma
   ↓
10. App lista en https://www.pawmatch.com
```

---

## Flujo de Datos

### Ejemplo: Crear una mascota (Admin)

```
1. Admin abre admin/pets.jsx
   ↓
2. Llena formulario con:
   - nombre: "Luna"
   - especie: "DOG"
   - foto: archivo.jpg
   ↓
3. Click "Crear Mascota"
   ↓
4. Frontend (React) prepara FormData:
   ```javascript
   const formData = new FormData();
   formData.append('name', 'Luna');
   formData.append('species', 'DOG');
   formData.append('image', archivo);
   
   fetch('/api/pets', {
     method: 'POST',
     body: formData,
   });
   ```
   ↓
5. Backend (pages/api/pets/index.js) recibe request:
   ```javascript
   const uploadMiddleware = upload.single('image');
   uploadMiddleware(req, res, async (err) => {
     const { name, species } = req.body;
     const imagePath = `/uploads/pets/${req.file.filename}`;
     
     // Validar
     if (!name || !species) {
       return res.status(400).json({ error: 'Campos requeridos' });
     }
     
     // Crear en BD
     const pet = await prisma.pet.create({
       data: {
         id: uuid(),
         name,
         species,
         image: imagePath,
         ...
       },
     });
     
     return res.json({ pet });
   });
   ```
   ↓
6. Archivo guardado en:
   public/uploads/pets/1684256789-abc123.jpg
   ↓
7. Registro guardado en BD:
   INSERT INTO pets (id, name, species, image) 
   VALUES ('uuid...', 'Luna', 'DOG', '/uploads/pets/1684256789-abc123.jpg')
   ↓
8. Response vuelve al frontend:
   ```json
   {
     "pet": {
       "id": "uuid...",
       "name": "Luna",
       "species": "DOG",
       "image": "/uploads/pets/1684256789-abc123.jpg"
     }
   }
   ```
   ↓
9. Frontend actualiza estado:
   setMessage('Mascota creada exitosamente')
   ↓
10. Página se actualiza con la nueva mascota
```

---

### Ejemplo: Usuario ve favoritos

```
1. Usuario entra a /profile
   ↓
2. useSession() obtiene sesión (NextAuth):
   ```javascript
   const { data: session } = useSession();
   // session.user.id = 'user-123'
   ```
   ↓
3. useEffect ejecuta fetch('/api/users/profile')
   ↓
4. Backend verifica autenticación:
   ```javascript
   const session = await getSession(req, res);
   if (!session?.user?.id) {
     return res.status(401).json({ error: 'No autenticado' });
   }
   ```
   ↓
5. Backend obtiene datos del usuario:
   ```javascript
   const user = await prisma.user.findUnique({
     where: { id: session.user.id },
     include: {
       favorites: {
         include: { pet: true }
       }
     }
   });
   ```
   ↓
6. SQL ejecutado en MySQL:
   ```sql
   SELECT u.*, pf.*, p.*
   FROM users u
   LEFT JOIN pet_favorites pf ON u.id = pf.user_id
   LEFT JOIN pets p ON pf.pet_id = p.id
   WHERE u.id = 'user-123'
   ```
   ↓
7. Datos retornan al frontend:
   ```json
   {
     "user": {
       "id": "user-123",
       "name": "Juan",
       "email": "juan@example.com",
       "favorites": [
         {
           "id": "fav-1",
           "pet": {
             "id": "pet-1",
             "name": "Luna",
             "image": "/uploads/pets/abc.jpg"
           }
         }
       ]
     }
   }
   ```
   ↓
8. Frontend renderiza la página:
   ```javascript
   {user.favorites.map(fav => (
     <PetCard key={fav.id} pet={fav.pet} />
   ))}
   ```
```

---

## Ejemplos Prácticos

### 1. Agregar mascota a favoritos

**Frontend:**
```javascript
// pages/search.jsx
const handleFavorite = async (petId) => {
  const res = await fetch(`/api/pets/${petId}/favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ petId }),
  });

  if (res.ok) {
    setFavorites([...favorites, petId]);
  }
};

return (
  <button onClick={() => handleFavorite(pet.id)}>
    {favorites.includes(pet.id) ? 'En Favoritos' : 'Favorito'}
  </button>
);
```

**Backend:**
```javascript
// pages/api/pets/[id]/favorite.js
if (method === 'POST') {
  const session = await getSession(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { id: petId } = req.query;

  // Verificar si ya existe
  const existing = await prisma.petFavorite.findUnique({
    where: {
      userId_petId: {
        userId: session.user.id,
        petId,
      },
    },
  });

  if (existing) {
    return res.status(200).json({ message: 'Ya está en favoritos' });
  }

  // Crear favorito
  const favorite = await prisma.petFavorite.create({
    data: {
      userId: session.user.id,
      petId,
    },
  });

  return res.status(201).json({ favorite });
}
```

---

### 2. Reportar mascota perdida

**Frontend:**
```javascript
// pages/lost-pets.jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('title', formData.title);
  formData.append('species', formData.species);
  formData.append('latitude', selectedLocation.latitude);
  formData.append('longitude', selectedLocation.longitude);
  
  imageFiles.forEach(file => {
    formData.append('images', file);
  });

  const res = await fetch('/api/lost-pets', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (res.ok) {
    setMessage('Reporte creado exitosamente');
    fetchReports();
  }
};
```

**Backend:**
```javascript
// pages/api/lost-pets/index.js
const uploadMiddleware = upload.array('images', 5);

return uploadMiddleware(req, res, async (err) => {
  const {
    title,
    species,
    latitude,
    longitude,
  } = req.body;

  // Validar coordenadas
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Ubicación requerida' });
  }

  const imagePaths = (req.files || []).map(
    file => `/uploads/lost-pets/${file.filename}`
  );

  const report = await prisma.lostPetReport.create({
    data: {
      userId: session.user.id,
      title,
      species,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      images: JSON.stringify(imagePaths),
      status: 'LOST',
    },
  });

  return res.status(201).json({ report });
});
```

---

### 3. Admin aprueba adopción

**Frontend:**
```javascript
// pages/admin/adoptions.jsx
const handleApprove = async (adoptionId) => {
  const res = await fetch(`/api/adoptions/${adoptionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'APPROVED' }),
  });

  if (res.ok) {
    setMessage('Adopción aprobada');
    fetchAdoptions();
  }
};
```

**Backend:**
```javascript
// pages/api/adoptions/[id].js
if (method === 'PUT') {
  const session = await getSession(req, res);
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo admins' });
  }

  const { status } = req.body;
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const adoption = await prisma.adoptionRequest.update({
    where: { id },
    data: { status },
  });

  return res.json({ adoption });
}
```

---

## Conclusión

PawMatch V3 utiliza un **stack JavaScript moderno y completo**:

- **Frontend**: React + Next.js + Tailwind + shadcn/ui (lo que ves)
- **Backend**: Next.js API Routes (lógica de negocio)
- **Base de Datos**: MySQL + Prisma (persistencia de datos)
- **Autenticación**: NextAuth.js + bcryptjs (seguridad)
- **Archivos**: Multer + local storage (uploads)
- **Deployment**: Docker + docker-compose (contenedores)
- **Librerías**: Recharts (gráficas), Leaflet (mapas), Nodemailer (emails)

Cada componente trabaja junto para crear una **aplicación web completa y profesional**.

