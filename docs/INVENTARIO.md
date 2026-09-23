# Autoria do código

Registro do que foi escrito para este projeto, separado do que veio pronto do
Laravel, do Vite e das dependências. Complementa a seção de uso de IA do
README.

---

## Arquivos escritos para o projeto

### Infraestrutura

| Arquivo | O que define |
|---|---|
| `docker-compose.yml` | Os três serviços, portas, volumes, ordem de subida e o roteiro de inicialização da API |
| `docker/api/Dockerfile` | Imagem do PHP 8.4 com as extensões do PostgreSQL |
| `docker/web/Dockerfile` | Imagem do Node 20 |
| `.env.example`, `api/.env.example` | Configuração de referência, sem segredos |
| `.gitignore` | O que não é versionado |
| `scripts/bootstrap.sh` | Geração do esqueleto do Laravel e do React usando apenas Docker |

### Domínio e backend

| Arquivo | O que define |
|---|---|
| `api/database/migrations/..._create_solicitacoes_table.php` | Tabela, restrições e índices |
| `api/app/Enums/Status.php` | Máquina de transição de status |
| `api/app/Enums/Categoria.php`, `Prioridade.php` | Valores válidos do domínio |
| `api/app/Models/Solicitacao.php` | Persistência, protocolo, status inicial, conversão de enums |
| `api/app/Http/Requests/` (3 arquivos) | Validação de criação, de mudança de status e de filtros |
| `api/app/Http/Controllers/SolicitacaoController.php` | Os cinco endpoints |
| `api/app/Http/Resources/SolicitacaoResource.php` | Formato da resposta |
| `api/routes/api.php` | Mapeamento de rotas |
| `api/bootstrap/app.php` | Registro das rotas de API e tratamento de 404 |
| `api/database/seeders/`, `api/database/factories/` | Dados fictícios |
| `api/lang/pt_BR/validation.php` | Mensagens de validação em português |
| `api/tests/` | 25 testes |
| `api/phpunit.xml` | Isolamento da suíte em SQLite |

### Frontend

| Arquivo | O que define |
|---|---|
| `web/src/types/solicitacao.ts` | Contrato da API em TypeScript |
| `web/src/types/estado.ts` | Os quatro estados de tela |
| `web/src/api/cliente.ts` | Cliente HTTP e tratamento de erro |
| `web/src/api/solicitacoes.ts` | Uma função por endpoint |
| `web/src/features/solicitacoes/` (6 arquivos) | Resumo, filtros, listagem, formulário, detalhe e etiquetas |
| `web/src/utils/formato.ts` | Formatação de data |
| `web/src/App.tsx`, `web/src/index.css` | Composição da tela e estilos |
| `web/vite.config.ts`, `web/src/test/setup.ts` | Configuração dos testes |

### Documentação

`README.md`, `docs/openapi.yaml`, `docs/USO-DE-IA.md` e este arquivo.

---

## Decisões de projeto

Estão registradas e justificadas no README, na seção de decisões
arquiteturais. As principais: a máquina de transição concentrada em um único
enum, a ausência de autenticação, a ausência de camada de repositório, os enums
como texto no banco, a remoção das tabelas fora do domínio, e a configuração do
Laravel vindo apenas de `api/.env`.

---

## O que não é autoria deste projeto

O esqueleto do Laravel e o template do React com TypeScript, gerados pelos
instaladores oficiais, e as dependências baixadas pelo Composer e pelo npm, que
não são versionadas.

Também não são autoria deste projeto o model `User` e as migrations de sessão,
cache e filas que vêm por padrão no Laravel: foram removidos, porque o domínio
não os utiliza.

---

## O que precisa ser explicável

Todos os arquivos listados na primeira seção, e todas as decisões da segunda.
O detalhamento de onde há domínio pleno e onde há limitação reconhecida está em
[`USO-DE-IA.md`](USO-DE-IA.md).
