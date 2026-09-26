# El Privilegio

MVP de una web de organización de eventos realizado con Next.js, React y TypeScript.

## Desarrollo

```bash
npm install
npm run dev
```

Abrir http://localhost:3000.

## Docker: iniciar todo con un comando

Docker levanta la aplicación, PostgreSQL, las migraciones y los datos iniciales.

```bash
docker compose up --build
```

Luego abrir:

- Sitio público: http://localhost:3000
- Administración: http://localhost:3000/admin

El contenedor usa la contraseña de PostgreSQL solicitada: `Lukaelcapo123*`.
El administrador inicial es `admin@elprivilegio.local` con contraseña `demo1234`.

Para detener los contenedores:

```bash
docker compose down
```

Los datos quedan guardados en el volumen `postgres_data`. Para borrar también la base local y comenzar de cero, ejecutar `docker compose down -v`.

## Verificación y producción

```bash
npm run typecheck
npm run build
npm start
```

## Base de datos

El proyecto usa PostgreSQL y Drizzle para guardar usuarios administradores, tipos de evento, servicios adicionales, órdenes e ítems de cada orden.

1. Copiar `.env.example` a `.env` y completar `DATABASE_URL`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET`.
2. Ejecutar `npm run db:migrate` para crear las tablas.
3. Ejecutar `npm run db:seed` para cargar los precios iniciales y crear el primer administrador.

Comandos disponibles:

```bash
npm run db:generate # crea una nueva migración después de cambiar db/schema.ts
npm run db:migrate  # aplica las migraciones pendientes
npm run db:seed     # carga catálogo inicial y administrador
```

Con la base configurada, el cotizador público consulta `/api/catalog` y el panel de `/admin` guarda los cambios en PostgreSQL. Sin conexión configurada, ambas pantallas conservan el modo de demostración local.

Incluye navegación adaptable, servicios, galería filtrable con ampliación y formulario que prepara una consulta para WhatsApp (+541139049957). El envío final lo realiza la persona en WhatsApp. No almacena datos ni requiere un backend.

Las fotografías remotas de Unsplash son ilustrativas y deben reemplazarse por fotografías propias antes de publicar. La paleta está inspirada en la pieza de marca provista. No se incorporaron promociones temporales, dirección, testimonios ni datos comerciales no confirmados.
