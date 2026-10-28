#!/bin/sh
# Arranque del backend en Docker: deja todo listo con un solo "docker compose up".
set -e
cd /var/www/html

# 1) Archivo .env
if [ ! -f .env ]; then
  echo ">> Creando .env desde .env.example"
  cp .env.example .env
fi

# 2) Clave de la aplicación
if ! grep -q '^APP_KEY=base64:' .env; then
  echo ">> Generando APP_KEY"
  php artisan key:generate --force
fi

# 3) Migraciones (reintenta hasta que MySQL esté listo)
intentos=0
until php artisan migrate --force > /tmp/migrate.log 2>&1; do
  intentos=$((intentos + 1))
  if [ "$intentos" -ge 40 ]; then
    echo ">> No se pudo migrar la base de datos:"
    cat /tmp/migrate.log
    exit 1
  fi
  echo ">> Esperando a MySQL... ($intentos)"
  sleep 3
done
cat /tmp/migrate.log

# 4) Datos de prueba (el seeder se omite solo si ya existen)
php artisan db:seed --force

# 5) Servidor
echo ">> API lista en http://localhost:8000/api"
exec php artisan serve --host=0.0.0.0 --port=8000
