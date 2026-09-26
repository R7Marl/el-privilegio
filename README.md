# El Privilegio

Sitio web y cotizador para El Privilegio, construido con Next.js, PostgreSQL y Drizzle.

## Producción con Docker

1. Copia `.env.example` como `.env`.
2. Define contraseñas únicas para PostgreSQL y administración, además de una clave de sesión aleatoria.
3. Inicia los servicios:

```bash
docker compose up --build -d
```

La web queda disponible en `http://localhost:3000` y el acceso administrativo en `/admin`.

PostgreSQL permanece dentro de la red privada de Docker; no se publica en un puerto del equipo.

Para publicar en un dominio, configura HTTPS en el proxy inverso y establece `ADMIN_COOKIE_SECURE=true` en `.env`.

## Comandos útiles

```bash
docker compose ps
docker compose logs -f app
docker compose down
npm run typecheck
npm run build
```

Las migraciones y el catálogo inicial se aplican al iniciar el contenedor. La cuenta del panel se crea con `ADMIN_EMAIL` y `ADMIN_PASSWORD` definidos en `.env`.
