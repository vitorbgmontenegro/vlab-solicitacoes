# Inventário: o que foi escrito à mão e o que foi gerado

Registro honesto de origem de cada arquivo do repositório. Serve para eu saber o
que é meu, o que é do framework e o que foi baixado, e para preencher a seção de
uso de IA do README.

Atualizado em 2026-09-19.

---

## Como conferir isso sozinho, sem acreditar em mim

O primeiro commit do projeto foi feito **antes** de qualquer instalação. Então:

```bash
git ls-files
```

O que essa lista mostrar foi escrito à mão. Tudo o mais que existe na pasta
ainda está sem rastreamento no Git, ou seja, apareceu depois, gerado por
ferramenta.

```bash
git status --short          # o que apareceu depois
find api -type f | wc -l    # a dimensão do que foi baixado
```

---

## Fase 1 — Escrito à mão, antes de instalar qualquer coisa

13 arquivos. Nenhum deles foi gerado por ferramenta.

| Arquivo | O que é |
|---|---|
| `docker-compose.yml` | Define os três serviços: `db`, `api`, `web`. Portas, variáveis, volumes, ordem de subida. |
| `docker/api/Dockerfile` | Receita do container de PHP: imagem base e extensões. |
| `docker/web/Dockerfile` | Receita do container de Node. |
| `.env.example` | Modelo de configuração, sem segredo real. |
| `.gitignore` | O que não entra no Git. |
| `scripts/bootstrap.sh` | Script que gera o Laravel e o React usando só Docker. |
| `docs/openapi.yaml` | Contrato da API: 4 endpoints, enums, erros. |
| `docs/PLANO.md` | Divisão dos 7 dias. |
| `docs/USO-DE-IA.md` | Registro de uso de IA, exigido pelo edital. |
| `README.md` | Esqueleto com as seções obrigatórias. |
| `CLAUDE.md` | Contexto do desafio para consulta. |
| `api/.gitkeep`, `web/.gitkeep` | Marcadores para as pastas vazias entrarem no Git. Apagados depois. |

Decisões tomadas nesta fase, e que são minhas para justificar em entrevista:

- Postgres 16, PHP 8.4, Node 20 como versões.
- Frontend e backend em pastas separadas no mesmo repositório.
- Servidor embutido do Laravel (`artisan serve`) em vez de nginx com php-fpm.
- Migrations e seeders rodando automaticamente na subida do container.
- Health check da API verificando a conexão com o banco.
- Sem autenticação, porque o escopo do desafio não define perfis distintos.
- Nenhuma biblioteca de terceiro adicionada.

---

## Fase 2 — Gerado por ferramenta

Duas linhas do `scripts/bootstrap.sh` produziram tudo o que existe em `api/` e
`web/`.

### Backend, linha 19 do bootstrap

```bash
composer create-project laravel/laravel .
```

O que isso produziu:

- O esqueleto do Laravel: `app/`, `config/`, `routes/`, `database/`, `public/`,
  `storage/`, `tests/`, `bootstrap/`, `artisan`. **60 arquivos.**
- O `api/composer.json`, escrito pela equipe do Laravel, não por mim. Ele é que
  lista `laravel/framework: ^13.17` e `laravel/tinker: ^3.0`.
- A pasta `api/vendor/`, com **8.853 arquivos**, que são as dependências do
  Laravel e as dependências delas. Baixadas pelo Composer, não escolhidas por
  ninguém aqui.
- O `api/.env` com a `APP_KEY` gerada.

### Frontend, linha 28 do bootstrap

```bash
npm create vite@latest . -- --template react-ts
```

O que isso produziu: **19 arquivos** em `web/`, incluindo o `package.json` que
lista React, React DOM, TypeScript, Vite e oxlint. Essa lista é do template do
Vite, não minha.

O `web/node_modules` não está na pasta do projeto. Ele vive num volume do
Docker, criado pelo `npm install` que roda no `command` do serviço `web`.

### Imagens baixadas do Docker Hub

Não são arquivos do repositório, são ambientes prontos:

- `postgres:16-alpine` — o banco inteiro.
- `php:8.4-cli-alpine` — base do container do backend.
- `node:20-alpine` — base do container do frontend.
- `composer:2` — usada uma vez no bootstrap e descartada.

---

## Fase 3 — Escrito e corrigido à mão, depois da instalação

| Arquivo | O que foi feito | Por quê |
|---|---|---|
| `api/routes/api.php` | **Criado.** Rota `/health` que confere a conexão com o Postgres. | O Laravel 13 não cria esse arquivo sozinho. |
| `api/bootstrap/app.php` | **Editado**, 2 linhas: `api:` e `apiPrefix: 'api/v1'`. | Registrar o arquivo de rotas e definir o prefixo da URL. |
| `scripts/bootstrap.sh` | **Corrigido.** Apagar os `.gitkeep` antes de instalar, e remover uma flag inválida do Vite. | O Composer recusa instalar em pasta não vazia. |
| `docker/api/Dockerfile` | **Corrigido.** PHP 8.3 → 8.4. | O Laravel 13 exige 8.4. O `vendor` foi resolvido por um PHP mais novo. |
| `.env` e `.env.example` | **Corrigido.** `DB_PORT_HOST` 5432 → 5433. | Conflito com um Postgres já instalado na máquina. |
| `api/CLAUDE.md`, `api/AGENTS.md`, `api/database/database.sqlite` | **Apagados.** | Vieram do instalador do Laravel e não servem ao projeto. |

---

## O resumo em números

| Origem | Quantidade |
|---|---|
| Escritos à mão antes de instalar | 13 |
| Escritos ou editados à mão depois | 5 |
| Gerados pelo esqueleto do Laravel | 60 |
| Baixados pelo Composer (`vendor/`) | 8.853 |
| Gerados pelo template do Vite | 19 |

Ou seja: cerca de 18 arquivos são decisão humana. O resto é framework e
dependência, igual em qualquer projeto Laravel ou React do mundo.

---

## O que isso significa para a entrevista

O que precisa ser explicável é a coluna de decisões da Fase 1 e os arquivos da
Fase 3, mais o código de domínio que ainda será escrito.

O conteúdo de `vendor/`, o model `User`, as migrations de cache e de filas, e o
`package.json` que veio dentro de `api/` não são código meu, e dizer isso é a
resposta correta, não uma desculpa.
