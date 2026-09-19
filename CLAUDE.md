# CLAUDE.md — Desafio Técnico Full Stack V-Lab (CIn/UFPE)

Arquivo de memória do projeto. Leia isto antes de escrever qualquer código.

---

## 1. O que é este projeto

Aplicação full stack para **registrar e acompanhar solicitações de atendimento**
encaminhadas a unidades públicas de saúde. É um desafio de processo seletivo do
V-Lab (CIn/UFPE) para vaga de bolsista de desenvolvimento full stack.

**Prazo:** 7 dias corridos a partir do recebimento do desafio.
**Candidato:** Vitor Buarque de Gusmão Montenegro (vbgm@cin.ufpe.br).
**Perfil de avaliação:** bolsa de desenvolvimento (não analista júnior) — a banca
espera fundamentos sólidos, integração real entre camadas, organização e
capacidade de reconhecer as próprias limitações; não espera arquitetura
distribuída avançada.

**Dados:** somente fictícios. Nada de informação médica real, documento pessoal
real ou dado sensível de terceiros. Nada de senha, token ou credencial
versionada.

---

## 2. Stack obrigatória (não substituir)

| Camada | Tecnologia |
|---|---|
| Frontend | React com TypeScript |
| Backend | PHP com Laravel (API REST) |
| Banco | PostgreSQL |
| Infra | Docker + Docker Compose |

Bibliotecas complementares são livres, desde que compatíveis, justificadas no
README e que não substituam as tecnologias obrigatórias.

---

## 3. Modelo de dados

Entidade `solicitacoes`, campos mínimos:

- `id` — identificador único
- `protocolo` — código único gerado pela aplicação
- `nome_solicitante` — nome fictício
- `categoria` — `CONSULTA` | `EXAME` | `VACINACAO` | `OUTRO`
- `prioridade` — `BAIXA` | `MEDIA` | `ALTA` | `URGENTE`
- `status` — `RECEBIDA` | `EM_ANALISE` | `AGENDADA` | `CONCLUIDA` | `CANCELADA`
- `descricao` — resumo da solicitação
- `justificativa_prioridade` — **obrigatória quando `prioridade = URGENTE`**
- `data_criacao`, `data_atualizacao`

---

## 4. Regras de negócio (eliminatórias)

1. Toda solicitação nasce com status `RECEBIDA`.
2. Todo registro tem protocolo único gerado automaticamente pela aplicação.
3. `prioridade = URGENTE` exige `justificativa_prioridade` preenchida.
4. `data_criacao` gerada automaticamente no cadastro.
5. `data_atualizacao` alterada sempre que a solicitação for atualizada.
6. Requisições inválidas devolvem mensagem clara e código HTTP adequado.
7. Transição de status obedece a máquina de estados abaixo.

### Máquina de estados

| De | Para (permitido) |
|---|---|
| `RECEBIDA` | `EM_ANALISE`, `CANCELADA` |
| `EM_ANALISE` | `AGENDADA`, `CANCELADA` |
| `AGENDADA` | `CONCLUIDA`, `CANCELADA` |
| `CONCLUIDA` | — (final) |
| `CANCELADA` | — (final) |

A transição precisa ter **implementação central, consistente e testável** — não
espalhada em controllers. Sugestão: uma classe de domínio
(`App\Domain\Solicitacao\StatusTransition` ou um enum PHP com o método
`podeTransicionarPara()`), usada tanto na validação quanto no service.

---

## 5. API REST — rotas sugeridas

| Método e rota | Comportamento |
|---|---|
| `POST /api/v1/solicitacoes` | Criar nova solicitação |
| `GET /api/v1/solicitacoes` | Listar com paginação e filtros por status, categoria e prioridade |
| `GET /api/v1/solicitacoes/{id}` | Detalhe de uma solicitação |
| `PATCH /api/v1/solicitacoes/{id}/status` | Atualizar status respeitando as transições |

As rotas são sugestões de padronização. Mudanças são permitidas desde que
consistentes, documentadas e preservando as funcionalidades.

---

## 6. Frontend — telas e comportamento

- Tela inicial com resumo das solicitações por status ou prioridade.
- Listagem paginada.
- Filtros por status, categoria e prioridade.
- Formulário de criação com validação de campos.
- Visualização do detalhe.
- Ação de atualização de status.
- Estados visuais explícitos: **carregando, sucesso, vazio e erro**.
- Layout minimamente responsivo, navegação compreensível.
- TypeScript de verdade: tipar os dados consumidos e enviados à API, evitar `any`.
- Cliente HTTP e tratamento de estados assíncronos organizados de forma
  consistente (um módulo de API tipado, não `fetch` solto em cada componente).
- Cuidados básicos de semântica HTML e acessibilidade.

---

## 7. Requisitos de arquitetura que a banca observa

**Backend**
- Validação rigorosa com Form Requests (ou equivalente consistente).
- Controllers finos: regra de negócio fora deles.
- Exceções e respostas HTTP consistentes, sem vazar detalhes internos.
- Eloquent, DI, transações, services, actions — **usar quando trouxerem clareza**.
  Policies só se houver autorização. Abstração sem benefício demonstrável é
  avaliada negativamente. Não over-engineer.
- Especificação **OpenAPI** versionada no repositório: endpoints, parâmetros e
  filtros, corpos de requisição, respostas de sucesso, erros de validação e
  principais códigos HTTP. Swagger UI é recomendada, não obrigatória. Não
  precisa ser gerada automaticamente.

**Banco**
- Modelagem relacional coerente com o domínio.
- Restrições de integridade para campos únicos e obrigatórios.
- Índices adequados aos filtros propostos (status, categoria, prioridade).
- Schema versionado **exclusivamente por migrations do Laravel**. Nenhuma
  alteração manual no banco deve ser necessária.

**Testes**
- Pelo menos um teste automatizado de regra de negócio relevante no backend
  (PHPUnit ou Pest) — priorizar cenário que demonstre comportamento, não
  cobertura de linhas. O alvo natural aqui é a máquina de transição de status.
- Pelo menos um teste relevante no frontend (Vitest/Jest + React Testing
  Library) **ou** um teste de integração ponta a ponta (Cypress/Playwright).
- Testes determinísticos, independentes de dados reais, executáveis conforme o
  README.

**Segurança**
- Nada de senha/token/credencial versionado.
- Nada de dado pessoal ou clínico real.
- Validar entradas, não expor detalhes internos nos erros.
- Autenticação é opcional (conta como bônus); se implementar, documentar perfis
  e decisões.

---

## 8. Bônus (até 20 pontos extras)

Só pontua se for pertinente e bem feito. Ferramenta sem utilidade demonstrável
não gera ponto.

- Autenticação e autorização simples com policies.
- Health check da API e verificação da conexão com o Postgres.
- Migrations rodando automaticamente na subida do ambiente, com seeders/factories.
- Logs estruturados, correlação de requisições, tratamento de falhas de integração.
- Pipeline de CI para lint, testes e build.
- Documentação arquitetural com diagrama simples e registro de decisões.
- Melhorias de acessibilidade e UX.
- Dados iniciais fictícios para facilitar a avaliação.
- Eventos, filas ou processamento assíncrono do Laravel — com justificativa.

**Prioridade recomendada dos bônus para este perfil:** health check → seeders +
migrations automáticas → diagrama/ADR curto no README → CI de lint e testes.
Filas e autenticação só se sobrar tempo.

---

## 9. Pontuação

| Critério | Pontos |
|---|---|
| Funcionamento e integração ponta a ponta | 25 |
| Backend | 15 |
| Frontend | 15 |
| Organização e arquitetura | 15 |
| Testes e confiabilidade | 15 |
| Validação, segurança e privacidade | 10 |
| Documentação e execução | 5 |
| **Base** | **100** |
| Bônus | +20 |

**Mínimos para não ser eliminado:** 60 dos 100 pontos da base, **e** pelo menos
6 dos 15 de backend, **e** pelo menos 6 dos 15 de frontend.

---

## 10. README obrigatório (é entregável, não enfeite)

Deve conter no mínimo:

1. Tecnologias e versões (React, TypeScript, PHP, Laravel, PostgreSQL).
2. Instruções completas para executar frontend, API, banco, migrations e seeders
   com Docker Compose.
3. Principais decisões arquiteturais, organização por domínio/responsabilidade,
   contratos entre frontend e API, justificativa das abstrações usadas.
4. O que foi implementado, o que não foi, limitações conhecidas e ajustes
   eventualmente necessários para execução.
5. Como rodar os testes e onde está a especificação OpenAPI.
6. **Descrição do uso de ferramentas de inteligência artificial.**

---

## 11. Política de IA do desafio

- O uso de IA é **permitido e encorajado**.
- É **obrigatório indicar no README** como as ferramentas foram usadas e em quais
  partes do projeto.
- Todo código entregue precisa ser **compreendido e explicável** pelo candidato.
- Na entrevista técnica podem pedir explicações ou pequenas alterações ao vivo.

**Consequência prática para este repositório:** manter `docs/USO-DE-IA.md`
atualizado durante o desenvolvimento, anotando data, o que foi gerado com apoio
de IA e o que foi revisado/reescrito à mão. Nada entra no repositório sem o Vitor
conseguir explicar linha a linha.

---

## 12. Convenções deste repositório

- Português nos nomes de domínio (`solicitacoes`, `protocolo`, `prioridade`),
  inglês na infraestrutura de código (`Service`, `Repository`, `Controller`).
- Backend em `api/`, frontend em `web/`, docs em `docs/`.
- Commits pequenos e em português, formato `tipo: descrição`
  (`feat: criar migration de solicitacoes`). O histórico de commits será olhado
  como evidência de organização — não fazer um commit único gigante.
- Variáveis de ambiente sempre por `.env`; `.env.example` versionado, `.env` não.
- Enums de domínio: PHP backed enums no Laravel, union types no TypeScript.
- Frontend organizado por funcionalidade/domínio, não por tipo de arquivo.

---

## 13. Estado atual

- [x] Estrutura de pastas e Docker Compose
- [ ] Laravel instalado em `api/` (rodar `scripts/bootstrap.sh`)
- [ ] React + TS + Vite instalado em `web/`
- [ ] Migration + enums + model `Solicitacao`
- [ ] Máquina de transição de status + testes
- [ ] Endpoints da API v1
- [ ] OpenAPI em `docs/openapi.yaml`
- [ ] Frontend: listagem, filtros, formulário, detalhe, troca de status
- [ ] Seeders com dados fictícios
- [ ] Testes de frontend
- [ ] README final + `docs/USO-DE-IA.md`

---

## 14. Preferências de trabalho do Vitor

- Explicações passo a passo, com exemplo concreto e correção explícita de erro.
- Prefere construir por partes a receber a solução inteira pronta — ele precisa
  entender tudo, e o desafio exige isso explicitamente.
- Linguagem simples e direta, sem jargão desnecessário.
- Layouts com flexbox, separação explícita de estado nos componentes, código
  comentado onde a decisão não é óbvia.
