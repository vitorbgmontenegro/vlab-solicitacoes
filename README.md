# Solicitações de Atendimento

Aplicação full stack para registrar e acompanhar solicitações de atendimento
encaminhadas a unidades públicas de saúde. Frontend e backend desacoplados por
uma API REST.

Desafio técnico do processo seletivo do V-Lab (CIn/UFPE).

**Todos os dados são fictícios.** Nenhuma informação médica real, documento
pessoal real ou dado sensível de terceiros foi utilizado, e nenhum segredo está
versionado.

---

## Tecnologias e versões

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React | 19 |
| | TypeScript | 6 |
| | Vite | 8 |
| Backend | PHP | 8.4 |
| | Laravel | 13 |
| Banco | PostgreSQL | 16 |
| Infraestrutura | Docker e Docker Compose | — |
| Testes | PHPUnit 12, Vitest 4, React Testing Library | — |

Nenhuma biblioteca de terceiros foi adicionada além do que Laravel e Vite
trazem por padrão. As únicas dependências acrescentadas são as de teste do
frontend (Vitest, React Testing Library e jsdom), citadas nominalmente pelo
próprio desafio.

---

## Como executar

Pré-requisito: Docker e Docker Compose. Nada mais precisa estar instalado, nem
PHP, nem Node, nem PostgreSQL.

```bash
git clone https://github.com/vitorbgmontenegro/vlab-solicitacoes.git
cd vlab-solicitacoes
docker compose up --build
```

A primeira subida demora alguns minutos, porque baixa as imagens e instala as
dependências. Na subida, o container da API automaticamente:

1. instala o `vendor/` com o Composer, se ainda não existir;
2. cria o `api/.env` a partir de `api/.env.example`, se ainda não existir;
3. gera a `APP_KEY`, se ainda não houver;
4. executa as migrations;
5. executa os seeders, que populam oito solicitações fictícias;
6. sobe o servidor.

Todas as etapas são idempotentes: subir de novo não refaz nada.

| Serviço | Endereço |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000/api/v1 |
| Health check | http://localhost:8000/api/v1/health |
| PostgreSQL | localhost:5433 |

### Configuração

O `.env` da raiz é opcional: o `docker-compose.yml` tem valor padrão para toda
variável. Para personalizar, copie o modelo:

```bash
cp .env.example .env
```

Esse arquivo configura o **container do PostgreSQL**. A configuração do
**Laravel** vem de `api/.env`, criado a partir de `api/.env.example`. Se mudar
as credenciais em um, mude no outro.

### Se a porta 5432 estiver ocupada

O banco é publicado em **5433** por padrão, justamente para não colidir com um
PostgreSQL instalado na máquina. Para mudar, ajuste `DB_PORT_HOST` no `.env` da
raiz.

---

## Endpoints

Prefixo: `/api/v1`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Estado da API e da conexão com o banco |
| `GET` | `/solicitacoes` | Lista com paginação e filtros por `status`, `categoria` e `prioridade` |
| `GET` | `/solicitacoes/resumo` | Contagem por status |
| `POST` | `/solicitacoes` | Cria uma solicitação |
| `GET` | `/solicitacoes/{id}` | Detalhe de uma solicitação |
| `PATCH` | `/solicitacoes/{id}/status` | Altera o status, respeitando as transições |

Especificação completa, com parâmetros, corpos e códigos de resposta:
[`docs/openapi.yaml`](docs/openapi.yaml).

### Códigos de resposta

| Código | Quando |
|---|---|
| 200 | Consulta ou atualização bem-sucedida |
| 201 | Solicitação criada |
| 404 | Recurso inexistente |
| 422 | Entrada inválida, incluindo transição de status proibida |

---

## Regras de negócio

- Toda solicitação nasce com status `RECEBIDA`.
- O protocolo é único e gerado pela aplicação, nunca informado por quem cadastra.
- Prioridade `URGENTE` exige `justificativa_prioridade`.
- `data_criacao` e `data_atualizacao` são mantidas automaticamente.
- A alteração de status obedece à máquina de estados:

| De | Para |
|---|---|
| `RECEBIDA` | `EM_ANALISE`, `CANCELADA` |
| `EM_ANALISE` | `AGENDADA`, `CANCELADA` |
| `AGENDADA` | `CONCLUIDA`, `CANCELADA` |
| `CONCLUIDA` | — (final) |
| `CANCELADA` | — (final) |

---

## Decisões arquiteturais

### A regra de transição existe em um lugar só

`api/app/Enums/Status.php` é a única implementação da máquina de estados. Ele é
consultado por:

- `AtualizarStatusRequest`, que recusa a requisição inválida com 422;
- `SolicitacaoResource`, que expõe `proximos_status_permitidos` na resposta;
- `StatusTransicaoTest`, que exercita a regra isolada.

O **frontend não conhece as regras de transição**. Ele desenha um botão para
cada item de `proximos_status_permitidos`. Mudar a máquina de estados no
backend muda os botões da tela sem tocar em React.

### Organização por responsabilidade

| Camada | Responsabilidade |
|---|---|
| Migration | Estrutura e restrições de integridade |
| Enums | Valores válidos do domínio e a regra de transição |
| Model | Persistência, protocolo, status inicial, conversão de enums |
| Form Requests | Validação da entrada |
| Controller | Orquestração, sem regra de negócio |
| Resource | Formato da resposta |

O controller tem quatro métodos, todos curtos. Validação, regra e formatação
vivem fora dele.

### Abstrações que não foram criadas

O desafio penaliza abstração sem benefício demonstrável, então:

- **Sem camada de repositório.** Há uma entidade e uma fonte de dados. Uma
  interface com uma única implementação seria indireção sem ganho.
- **Sem service de criação.** A criação é `Solicitacao::create($validados)`.
  Um service que apenas repassasse a chamada não acrescentaria nada.
- **Sem método `exigeJustificativa()` no enum `Prioridade`.** A regra já existe
  no Form Request. Duplicar em dois lugares é pior que ter em um.
- **Sem roteador no frontend.** A aplicação tem uma tela; o detalhe é um painel
  sobreposto. Um roteador seria dependência nova sem necessidade.

### Sem autenticação

O escopo do desafio não define perfis distintos de usuário: o sistema é operado
internamente, e todas as ações previstas são do mesmo tipo de operador.
Implementar login e perfis sem uma separação real de permissões acrescentaria
complexidade sem benefício.

Se fosse necessário separar solicitante e analista, o caminho seria Sanctum
para autenticação, uma coluna de perfil no usuário, e Policies restringindo a
mudança de status ao perfil de analista.

### Datas com o nome do framework no banco, e o do contrato na API

O banco usa `created_at` e `updated_at`, mantidos automaticamente pelo Eloquent.
O `SolicitacaoResource` os expõe como `data_criacao` e `data_atualizacao`,
conforme o contrato do desafio. Assim o contrato externo é respeitado sem abrir
mão do comportamento automático do framework.

### Enums como texto no banco

Os valores válidos vivem nos PHP backed enums, e não em um tipo enum nativo do
PostgreSQL. O tipo nativo é rígido para alterar e dividiria a fonte da verdade
entre banco e código. Uma alternativa considerada foi um `CHECK constraint`,
que daria garantia no banco sem essa rigidez; ficou de fora por
proporcionalidade.

### O schema contém apenas o domínio

As migrations de `users`, `cache`, `jobs` e `sessions`, que vêm por padrão no
Laravel, foram removidas, junto com o model `User` e a configuração de
autenticação. Os drivers de sessão, cache e fila foram ajustados para não
depender de banco. **O schema tem uma única tabela de negócio: `solicitacoes`.**

### A configuração do Laravel vem apenas de `api/.env`

Nada é injetado como variável de ambiente do container. O motivo é concreto:
variável de ambiente vence qualquer outra fonte, inclusive a configuração de
teste do `phpunit.xml`. Enquanto o `docker-compose.yml` injetava
`DB_CONNECTION=pgsql`, a suíte de testes rodava contra o banco de
desenvolvimento e apagava os dados a cada execução.

O custo dessa decisão é que as credenciais aparecem em dois arquivos, o `.env`
da raiz e o `api/.env`. Há comentário nos dois avisando.

### Servidor embutido do Laravel

A API sobe com `php artisan serve`, e não com nginx e php-fpm. Menos peças para
falhar na avaliação, em um contexto onde reprodutibilidade vale mais que
infraestrutura de produção. Não é a configuração que se usaria em produção.

### Contrato tipado entre as pontas

`web/src/types/solicitacao.ts` espelha o contrato da API. Os valores são
declarados como listas `as const` e os tipos derivados delas, de modo que a
mesma declaração sirva para a checagem de tipos e para montar os `<select>`.

Todo acesso à API passa por `web/src/api/`. Nenhum componente chama `fetch`.

### Estados de tela como união discriminada

`web/src/types/estado.ts` define carregando, sucesso, vazio e erro como um único
tipo. O TypeScript só permite acessar os dados após confirmar a situação de
sucesso, o que torna estados impossíveis não compiláveis.

---

## Testes

```bash
# Backend: 25 testes
docker compose exec api php artisan test

# Frontend: 4 testes
docker compose exec web npm test
```

**Backend.** `tests/Unit/StatusTransicaoTest.php` tem 17 casos sobre a máquina
de transição: as seis transições permitidas, oito proibidas relevantes, e três
invariantes (status final não tem saída, nenhum status transiciona para si
mesmo, e toda solicitação em andamento pode ser cancelada). As duas últimas são
escritas em laço sobre `Status::cases()`, então um status novo passa a ser
coberto automaticamente.

`tests/Feature/SolicitacaoApiTest.php` tem 8 casos de integração, com requisição
HTTP atravessando rota, validação, controller, model, banco e resource.

**Frontend.** `FormularioSolicitacao.test.tsx` cobre o bloqueio de envio com
campos vazios, o campo de justificativa aparecendo apenas quando a prioridade é
urgente, a exigência da justificativa, e o envio dos dados corretos.

Os testes de frontend substituem o módulo de API por uma versão falsa: a
integração real já é coberta pelos testes de feature do backend.

Os testes de backend rodam em SQLite na memória, isolados do banco de
desenvolvimento.

---

## Funcionalidades implementadas

**Backend:** os quatro endpoints do desafio, mais health check e resumo por
status. Validação com Form Requests, máquina de transição centralizada,
respostas de erro consistentes e em português, paginação, filtros, índices nos
campos filtrados, migrations, seeders idempotentes e factories.

**Frontend:** resumo por status clicável, listagem paginada, filtros por status,
categoria e prioridade, formulário de criação com validação, painel de detalhe,
mudança de status oferecendo apenas transições válidas, e os quatro estados de
tela.

**Infraestrutura:** subida integrada com um comando, health check verificando a
conexão com o banco, migrations e seeders automáticos, dados iniciais fictícios.

---

## Não implementado e limitações conhecidas

- **Busca por protocolo ou nome.** Não consta no escopo do desafio. Foi
  considerada e deixada de fora para priorizar os itens pedidos. É a primeira
  coisa que eu acrescentaria.
- **Autenticação e perfis.** Decisão registrada acima.
- **Histórico de mudanças de status.** Apenas a data da última atualização é
  guardada. Um histórico completo exigiria uma segunda tabela que o escopo não
  pede.
- **Testes em SQLite.** A suíte não detectaria uma diferença de comportamento
  entre SQLite e PostgreSQL.
- **Sem pipeline de integração contínua.** Os testes rodam por comando.
- **Cobertura de testes parcial no frontend.** Apenas o formulário é testado; a
  listagem, os filtros e o painel de detalhe não têm teste automatizado.
- **`php artisan serve` no lugar de nginx.** Decisão registrada acima.

---

## Uso de inteligência artificial

Uma única ferramenta foi utilizada: **Claude (Anthropic)**, em conversa, ao
longo de todo o desenvolvimento. Nenhuma outra, incluindo autocompletar de
editor.

O trabalho foi conversacional e incremental: cada peça era escrita com
explicação linha por linha, revisada por mim antes de entrar, e só então
commitada. As decisões de projeto foram tomadas por mim a partir das
alternativas apresentadas, e estão registradas na seção de decisões acima. As
mensagens de commit são minhas.

Este foi meu primeiro projeto em PHP e Laravel. Domino o modelo de domínio, o
contrato da API, a separação de responsabilidades e o frontend; tenho limitação
reconhecida nos detalhes internos do framework.

O registro detalhado, incluindo os erros reais enfrentados e como foram
diagnosticados, está em [`docs/USO-DE-IA.md`](docs/USO-DE-IA.md).

---

## Estrutura do repositório

```
api/                      Backend Laravel
  app/Enums/              Status, Categoria, Prioridade
  app/Http/Requests/      Validação de entrada
  app/Http/Controllers/   Endpoints
  app/Http/Resources/     Formato da resposta
  app/Models/             Solicitacao
  database/migrations/    Schema
  database/seeders/       Dados fictícios
  lang/pt_BR/             Mensagens de validação
  tests/                  25 testes

web/                      Frontend React
  src/types/              Contrato da API e estados de tela
  src/api/                Cliente HTTP
  src/features/           Componentes por domínio
  src/utils/              Formatação

docker/                   Dockerfiles
docs/                     OpenAPI, plano, uso de IA, inventário
```
