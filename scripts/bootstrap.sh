#!/usr/bin/env bash
# Gera o esqueleto do Laravel em api/ e do React+TS em web/ usando só Docker.
# Rode uma única vez, na raiz do projeto:  bash scripts/bootstrap.sh
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

echo "==> 1/4  Criando .env a partir do .env.example"
[ -f .env ] || cp .env.example .env

echo "==> 2/4  Instalando Laravel em api/"
if [ -f api/artisan ]; then
  echo "    api/ já tem um Laravel instalado, pulando."
else
  # O Composer recusa instalar em pasta nao vazia, e o .gitkeep conta.
  rm -f api/.gitkeep
  docker run --rm -v "$ROOT/api":/app -w /app composer:2 \
    composer create-project laravel/laravel . --no-interaction
fi

echo "==> 3/4  Criando React + TypeScript (Vite) em web/"
if [ -f web/package.json ]; then
  echo "    web/ já tem um projeto, pulando."
else
  rm -f web/.gitkeep
  docker run --rm -v "$ROOT/web":/app -w /app node:20-alpine \
    sh -c "npm create vite@latest . -- --template react-ts"
fi

echo "==> 4/4  Ajustando o .env do Laravel para o Postgres do compose"
if [ -f api/.env ]; then
  sed -i.bak \
    -e 's/^DB_CONNECTION=.*/DB_CONNECTION=pgsql/' \
    -e 's/^# *DB_HOST=.*/DB_HOST=db/' \
    -e 's/^DB_HOST=.*/DB_HOST=db/' \
    -e 's/^# *DB_PORT=.*/DB_PORT=5432/' \
    -e 's/^DB_PORT=.*/DB_PORT=5432/' \
    -e 's/^# *DB_DATABASE=.*/DB_DATABASE=solicitacoes/' \
    -e 's/^DB_DATABASE=.*/DB_DATABASE=solicitacoes/' \
    -e 's/^# *DB_USERNAME=.*/DB_USERNAME=vlab/' \
    -e 's/^DB_USERNAME=.*/DB_USERNAME=vlab/' \
    -e 's/^# *DB_PASSWORD=.*/DB_PASSWORD=vlab_dev/' \
    -e 's/^DB_PASSWORD=.*/DB_PASSWORD=vlab_dev/' \
    api/.env
  rm -f api/.env.bak
fi

echo
echo "Pronto. Agora suba tudo com:"
echo "    docker compose up --build"
echo
echo "  API .... http://localhost:8000"
echo "  Web .... http://localhost:5173"
