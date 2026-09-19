# Plano de execução — 7 dias

Ordem pensada para garantir os pontos eliminatórios primeiro. O edital é
explícito: vale mais um fluxo ponta a ponta bem feito e estável do que muitas
telas com bug.

## Dia 1 — Ambiente e domínio

- [ ] Rodar `scripts/bootstrap.sh` e subir `docker compose up`
- [ ] Confirmar que a API responde e conecta no Postgres
- [ ] Migration de `solicitacoes` com unique em `protocolo` e índices em
      `status`, `categoria`, `prioridade`
- [ ] Enums PHP: `Categoria`, `Prioridade`, `Status`
- [ ] Model `Solicitacao` com casts de enum e datas
- [ ] Primeiro commit

## Dia 2 — Regra de negócio e testes de backend

- [ ] Geração de protocolo único
- [ ] Máquina de transição de status em um ponto central e testável
- [ ] Teste de transição: caminhos válidos e inválidos (é o teste que a banca
      espera ver)
- [ ] Form Requests: criação e mudança de status, com a regra de
      `justificativa_prioridade` quando `URGENTE`

## Dia 3 — API REST

- [ ] `POST /api/v1/solicitacoes`
- [ ] `GET /api/v1/solicitacoes` com paginação e filtros
- [ ] `GET /api/v1/solicitacoes/{id}`
- [ ] `PATCH /api/v1/solicitacoes/{id}/status`
- [ ] Handler de exceções: respostas de erro consistentes, sem vazar interno
- [ ] Seeders/factories com dados fictícios

## Dia 4 — Frontend, parte 1

- [ ] Vite + React + TS rodando e falando com a API
- [ ] Tipos TypeScript espelhando os contratos da API (sem `any`)
- [ ] Cliente HTTP centralizado
- [ ] Listagem paginada com os quatro estados: carregando, sucesso, vazio, erro
- [ ] Filtros por status, categoria e prioridade

## Dia 5 — Frontend, parte 2

- [ ] Formulário de criação com validação e mensagens claras
- [ ] Tela de detalhe
- [ ] Ação de mudança de status (só oferecer as transições permitidas)
- [ ] Tela inicial com resumo por status
- [ ] Responsividade e semântica/acessibilidade básicas

## Dia 6 — Qualidade

- [ ] Teste de frontend (Vitest + React Testing Library) ou E2E
- [ ] `docs/openapi.yaml` completo
- [ ] Health check da API (bônus barato)
- [ ] Lint/format nas duas pontas
- [ ] Revisar tudo e conseguir explicar cada arquivo

## Dia 7 — Entrega

- [ ] README completo, incluindo seção de uso de IA
- [ ] Testar do zero: `git clone` → `bootstrap` → `docker compose up`
- [ ] Listar limitações conhecidas com honestidade
- [ ] Revisar histórico de commits

## Lembretes

- Mínimo para não ser eliminado: 60/100 na base, 6/15 no backend, 6/15 no frontend.
- Abstração sem utilidade demonstrável **perde** ponto. Não inventar camada.
- Nada de dado real, nada de credencial versionada.
