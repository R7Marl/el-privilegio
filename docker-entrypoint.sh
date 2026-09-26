#!/bin/sh
set -eu

echo "Aplicando migraciones de PostgreSQL..."
npm run db:migrate

echo "Cargando datos iniciales..."
npm run db:seed

exec "$@"
