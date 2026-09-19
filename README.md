# Solicitações de Atendimento — Desafio Técnico Full Stack V-Lab

> **Esqueleto do README.** As seções marcadas com `TODO` precisam ser preenchidas
> antes da entrega — o edital lista o README como item pontuado (5 pontos) e
> exige cada um dos tópicos abaixo.

Aplicação full stack para registrar e acompanhar solicitações de atendimento
encaminhadas a unidades públicas de saúde. Frontend e backend desacoplados por
uma API REST.

Todos os dados usados são **fictícios**.

---

## Tecnologias e versões

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + TypeScript (Vite) | `TODO` |
| Backend | PHP + Laravel | `TODO` |
| Banco | PostgreSQL | 16 |
| Infra | Docker + Docker Compose | — |

---

## Como executar

Pré-requisitos: Docker e Docker Compose.

```bash
# 1. Gerar os esqueletos do Laravel e do React (uma única vez)
bash scripts/bootstrap.sh

# 2. Subir tudo
docker compose up --build
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000/api/v1 |
| PostgreSQL | localhost:5432 |

As migrations e os seeders rodam automaticamente na subida do container `api`.
Para rodá-los manualmente:

```bash
docker compose exec api php artisan migrate --seed
```

Variáveis de ambiente ficam no `.env` da raiz (veja `.env.example`). Nenhum
segredo real é versionado.

---

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/solicitacoes` | Cria uma solicitação |
| `GET` | `/api/v1/solicitacoes` | Lista com paginação e filtros (`status`, `categoria`, `prioridade`) |
| `GET` | `/api/v1/solicitacoes/{id}` | Detalhe |
| `PATCH` | `/api/v1/solicitacoes/{id}/status` | Atualiza o status |

Especificação completa: [`docs/openapi.yaml`](docs/openapi.yaml).

---

## Regras de negócio

- Toda solicitação nasce com status `RECEBIDA`.
- Protocolo único gerado automaticamente pela aplicação.
- `prioridade = URGENTE` exige `justificativa_prioridade`.
- Transições de status permitidas:

| De | Para |
|---|---|
| `RECEBIDA` | `EM_ANALISE`, `CANCELADA` |
| `EM_ANALISE` | `AGENDADA`, `CANCELADA` |
| `AGENDADA` | `CONCLUIDA`, `CANCELADA` |
| `CONCLUIDA` | — (final) |
| `CANCELADA` | — (final) |

---

## Decisões arquiteturais

`TODO` — organização por domínio/responsabilidade, contratos entre frontend e
API, e a justificativa de cada abstração usada (services, actions, form
requests). Abstração sem benefício demonstrável perde ponto, então justificar
cada uma.

---

## Testes

```bash
# Backend
docker compose exec api php artisan test

# Frontend
docker compose exec web npm run test
```

`TODO` — descrever quais cenários são cobertos.

---

## Funcionalidades implementadas / não implementadas

`TODO` — lista honesta do que está pronto, do que ficou de fora, limitações
conhecidas e ajustes necessários para execução. O edital diz explicitamente que
funcionalidade não concluída **não invalida** a entrega quando informada com
transparência.

---

## Uso de inteligência artificial

`TODO` — obrigatório pelo edital. Ver [`docs/USO-DE-IA.md`](docs/USO-DE-IA.md) e
resumir aqui: quais ferramentas foram usadas e em quais partes do projeto.
