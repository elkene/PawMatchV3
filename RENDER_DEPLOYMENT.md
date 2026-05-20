# Guía de Despliegue Gratuito en Render

**Última actualización**: 14 de mayo de 2026

---

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Preparar el Repositorio en GitHub](#paso-1-preparar-el-repositorio-en-github)
3. [Paso 2: Configurar Base de Datos MySQL](#paso-2-configurar-base-de-datos-mysql)
4. [Paso 3: Desplegar en Render](#paso-3-desplegar-en-render)
5. [Paso 4: Configurar Variables de Entorno](#paso-4-configurar-variables-de-entorno)
6. [Paso 5: Verificar y Probar](#paso-5-verificar-y-probar)
7. [Limitaciones del Plan Gratuito](#limitaciones-del-plan-gratuito)
8. [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

- Cuenta en [GitHub](https://github.com) (gratis)
- Cuenta en [Render.com](https://render.com) (gratis)
- Cuenta en [Railway.app](https://railway.app) o [Aiven.io](https://aiven.io) para la base de datos (gratuito con límites)
- El repositorio PawMatchV3 sincronizado en GitHub

---

## Paso 1: Preparar el Repositorio en GitHub

### 1.1 Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Haz clic en el ícono `+` en la esquina superior derecha
3. Selecciona **New repository**
4. Nombre: `pawmatch-v3`
5. Descripción: `Pet adoption platform with Next.js`
6. Selecciona **Public** (para acceder desde Render sin problemas)
7. Haz clic en **Create repository**

### 1.2 Subir el Código a GitHub

```bash
# En la carpeta de tu proyecto
git remote add origin https://github.com/TU_USUARIO/pawmatch-v3.git
git branch -M main
git push -u origin main
```

### 1.3 Asegúrate de que `.gitignore` está correcto

El archivo `.gitignore` debe incluir:

```
node_modules/
.env.local
.env
.next/
build/
public/uploads/
```

**NO commits `.env.local` a GitHub** - usaremos Render para configurar variables.

---

## Paso 2: Configurar Base de Datos MySQL

### Opción A: Usar Railway.app (Recomendado - Más Simple)

#### 2A.1 Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **New Project**
3. Selecciona **Provision MySQL**
4. Espera a que se cree la base de datos (2-3 minutos)

#### 2A.2 Obtener la Conexión

1. En Railway, ve al plugin MySQL
2. Haz clic en **Connect**
3. Copia la cadena de conexión que se ve así:

```
mysql://username:password@host:port/dbname
```

Guarda esta URL - la necesitarás en Render.

#### 2A.3 Crear Base de Datos

1. En Railway, ve a la sección **Conductor**
2. Busca `MYSQL_URL` o similar - esa es tu cadena de conexión completa

### Opción B: Usar Aiven.io (Más Controles Granulares)

1. Ve a [aiven.io](https://aiven.io)
2. Crea una cuenta gratuita
3. Crea un nuevo servicio **MySQL**
4. Selecciona la región más cercana
5. En el plan gratuito, elige la opción más pequeña
6. Espera a que se inicie (5-10 minutos)
7. Ve a **Connection** y copia la cadena de conexión

---

## Paso 3: Desplegar en Render

### 3.1 Conectar GitHub a Render

1. Ve a [render.com](https://render.com)
2. Haz clic en **Dashboard**
3. Haz clic en **New +** (esquina superior derecha)
4. Selecciona **Web Service**
5. Haz clic en **Connect a repository**
6. Haz clic en **Configure account** (primera vez)
7. Autoriza GitHub a Render
8. Selecciona tu repositorio `pawmatch-v3`
9. Haz clic en **Connect**

### 3.2 Configurar Web Service

**Nombre**: `pawmatch-v3`

**Environment**: `Node`

**Build Command**:
```
npm install --legacy-peer-deps && npm run build
```

**Start Command**:
```
npm start
```

**Instance Type**: `Free` (créditos gratuitos $7/mes)

### 3.3 Crear y Hacer Deploy

1. Haz clic en **Create Web Service**
2. Render comenzará a construir la aplicación (toma 5-10 minutos)
3. Monitorea los logs para asegurarte de que no hay errores

---

## Paso 4: Configurar Variables de Entorno

### 4.1 En el Dashboard de Render

1. Ve a tu Web Service `pawmatch-v3`
2. Haz clic en **Environment** (en el menú lateral)
3. Haz clic en **Add Environment Variable**

### 4.2 Variables Necesarias

Agrega las siguientes variables una por una:

```
# Base de Datos
DATABASE_URL = mysql://username:password@host:port/dbname
# (Reemplaza con la URL que copiaste de Railway/Aiven)

# NextAuth
NEXTAUTH_URL = https://pawmatch-v3.onrender.com
# (Reemplaza "pawmatch-v3" con tu nombre de servicio)

NEXTAUTH_SECRET = generar_una_clave_aleatoria_larga
# Generador: https://generate-secret.vercel.app/32

# Email (Nodemailer)
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = tu-email@gmail.com
SMTP_PASS = tu-app-password
# (Ver instrucciones abajo)

SMTP_FROM = "PawMatch <noreply@pawmatch.com>"
```

### 4.3 Generar NEXTAUTH_SECRET

En tu terminal local, ejecuta:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado y pégalo en `NEXTAUTH_SECRET`.

### 4.4 Configurar Gmail para Email

1. Ve a [Google Account](https://myaccount.google.com)
2. Haz clic en **Security** (izquierda)
3. Activa **2-Step Verification** si no está activo
4. En **App passwords**, crea una contraseña de aplicación para `Mail`
5. Copia esa contraseña y úsala como `SMTP_PASS`

---

## Paso 5: Verificar y Probar

### 5.1 Desplegar Cambios

Una vez que hayas agregado todas las variables:

1. Ve a tu servicio en Render
2. Haz clic en **Manual Deploy** (botón azul arriba a la derecha)
3. Selecciona **Deploy latest commit**
4. Espera a que se complete (5-10 minutos)

### 5.2 Probar la Aplicación

1. Copia la URL de tu servicio (aparece en el panel superior)
2. Abre en un navegador: `https://tu-servicio.onrender.com`
3. Deberías ver la página de login
4. Prueba los flujos principales:
   - Registro de usuario
   - Login
   - Búsqueda de mascotas
   - Solicitud de adopción

### 5.3 Ejecutar Migraciones de BD

Render ejecuta automáticamente la migración con el comando `npm run build`, pero si necesitas hacer seed:

1. En Render, ve a **Shell** en tu servicio
2. Ejecuta:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

---

## Limitaciones del Plan Gratuito

### Render (Web Service)

| Límite | Detalles |
|--------|----------|
| **CPU** | Compartida (no garantizada) |
| **Memoria** | 512 MB |
| **Almacenamiento** | No persistente (se borra al redeploy) |
| **Uptime** | Se detiene después de 15 min sin actividad |
| **Créditos** | $7/mes gratis |

### Problema: Archivos Subidos Se Pierden

**Problema**: Los archivos en `public/uploads/` se borran cuando Render reinicia la aplicación.

**Soluciones**:

#### Opción 1: Usar Cloudinary (Gratis para Inicial)

1. Ve a [cloudinary.com](https://cloudinary.com)
2. Crea una cuenta gratuita
3. Sube archivos a Cloudinary en lugar de guardarlos localmente
4. Modifica `pages/api/users/upload-avatar.js` y `pages/api/lost-pets/index.js` para usar Cloudinary

#### Opción 2: Usar AWS S3 (Tier Gratuito)

1. Ve a [aws.amazon.com](https://aws.amazon.com)
2. Crea una cuenta gratuita
3. Crea un bucket S3
4. Usa `aws-sdk` en Node.js para subir archivos a S3
5. Sirve imágenes desde las URLs de S3

#### Opción 3: Aceptar la Limitación

Para desarrollo/pruebas, puedes simplemente aceptar que los archivos se pierden. En producción real, necesitarás una de las opciones anteriores.

---

## Solución de Problemas

### "Build Command Failed"

**Solución**:
1. Ve a los **Logs** en Render
2. Busca el error específico
3. Causas comunes:
   - `npm install` falla: asegúrate de `--legacy-peer-deps`
   - Variable de BD no está configurada
   - Versión de Node no compatible

### "Application is spinning up..."

**Causa**: La aplicación está iniciando o reiniciando.

**Solución**:
- Espera 1-2 minutos
- Si persiste, ve a **Manual Deploy** > **Deploy latest commit**

### "Cannot connect to database"

**Solución**:
1. Verifica que `DATABASE_URL` está correctamente configurada
2. En tu base de datos, permite conexiones desde cualquier IP:
   - **Railway**: Automático
   - **Aiven**: Ve a **VPC** > Agrega la IP de Render (o `0.0.0.0/0` para desarrollo)
3. Ejecuta en **Shell**:
   ```bash
   npx prisma db push
   ```

### "NEXTAUTH_URL mismatch"

**Problema**: Las URLs de login no funcionan.

**Solución**:
1. Obtén tu URL real de Render (ej: `https://pawmatch-v3.onrender.com`)
2. Ve a **Environment** en tu servicio
3. Actualiza `NEXTAUTH_URL` a esa URL exacta
4. Haz **Manual Deploy**

### Las Imágenes No Se Cargan

**Causa**: Los archivos en `public/uploads/` se borraron.

**Solución**:
- Usa Cloudinary o S3 (ver sección anterior)
- O re-sube las imágenes después de desplegar

### Email No Se Envía

**Solución**:
1. Verifica credenciales de Gmail en **Environment**
2. Asegúrate de haber creado una **App Password** (no tu contraseña normal)
3. Habilita **Less secure apps** en Google si tienes problemas
4. Prueba enviando un email de reset de contraseña

---

## Próximos Pasos para Producción Real

Una vez que todo funcione en el plan gratuito, considera actualizar:

1. **Render Paid Plan**: $7+/mes para aplicación más estable
2. **Base de Datos Pagada**: Railway o Aiven ($5+/mes)
3. **Almacenamiento de Archivos**: Cloudinary ($99+/mes) o AWS S3
4. **Dominio Personalizado**: `pawmatch.com` (~$12/año)

---

## Checklist de Despliegue

- [ ] Repositorio creado y sincronizado en GitHub
- [ ] Base de datos MySQL creada en Railway/Aiven
- [ ] Servicio Web creado en Render
- [ ] Todas las variables de entorno configuradas
- [ ] Primer deploy completado exitosamente
- [ ] Login funciona
- [ ] Búsqueda de mascotas funciona
- [ ] Email de recuperación de contraseña funciona
- [ ] Archivos se suben (temporal, se pierden en reinicio)

---

## Contacto y Soporte

Si tienes problemas:

1. Revisa los **Logs** en Render (muy detallados)
2. Verifica todas las variables de entorno
3. Prueba en local con `npm run dev` primero
4. Consulta la documentación de [Render](https://render.com/docs)

---

**¡Tu aplicación está lista para el mundo!** 🎉
