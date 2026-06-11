# AGENTS.md - host-monitor

Aplicação de monitoramento de hosts construída com Express.js (TypeScript/ESM), Prisma, Postgres e frontend estático.

## Comandos essenciais

```bash
npm install               # instalar dependências
npm run dev               # desenvolvimento com hot reload
npm run build             # gera Prisma Client, compila TypeScript para dist
npm start                 # execução padrão a partir de dist
npm run typecheck         # gera Prisma Client e valida tipos sem emitir arquivos
npm test                  # typecheck + testes de API + testes de frontend
npm run test:api          # testes de API com NODE_ENV=test e banco de teste
npm run test:front        # testes de frontend (Vitest)
npm run format            # formata código com Prettier
npm run format:check      # verifica formatação sem alterar arquivos
```

### Banco de dados

```bash
npm run db:generate       # gera Prisma Client em src/generated/prisma
npm run db:migrate        # executa migrations (POSTGRES_HOST=localhost)
npm run db:seed           # carrega dados iniciais do seed.json
npm run db:load           # migrate + seed
npm run db:drop           # reset forçado do banco (apaga e recria)
npm run db:reload         # db:drop + db:seed (sem migrate)
npm run db:studio         # abre Prisma Studio localmente
```

## Docker

```bash
docker compose up --build          # desenvolvimento local com Postgres + pgAdmin
docker compose -f docker-compose.prod.yml up --build  # produção
```

Serviços disponíveis no Compose de desenvolvimento:

| Serviço      | Container       | Porta              |
| ------------ | --------------- | ------------------ |
| API          | host-monitor    | `HOST_MONITOR_PORT` → 3000 |
| PostgreSQL   | postgres        | `POSTGRES_PORT` → 5432    |
| pgAdmin      | pgadmin         | 8080               |

## Estrutura relevante

```text
src/
  index.ts                         # app Express e bootstrap HTTP (porta 3000)
  routes/hosts.route.ts            # rotas da API de hosts
  routes/auth.route.ts             # rotas de cadastro/login de usuários
  controllers/hosts.controller.ts  # handlers HTTP da API de hosts
  controllers/auth.controller.ts   # handlers HTTP de autenticação
  models/Hosts.ts                  # regras de negócio, histórico e estatísticas
  models/Users.ts                  # cadastro, login, hash de senha e emissão JWT
  schemas/host.ts                  # schemas Zod de hosts
  schemas/auth.ts                  # schemas Zod de autenticação
  types.ts                         # contratos compartilhados da aplicação
  errors/
    HttpError.ts                   # erro HTTP genérico com status code
    HostError.ts                   # erros de domínio de hosts
  jobs/
    pingHosts.ts                   # job de ping em background para todos os hosts
  lib/
    jwt.ts                         # emissão e verificação de tokens JWT
    password.ts                    # hash e comparação de senha
    ping.ts                        # execução de ping via sistema operacional
  middleware/
    errorHandlers.ts               # tratamento centralizado de erros
    requireJsonContentType.ts      # valida Content-Type: application/json
    validation.ts                  # middleware de validação com Zod
  database/
    database.ts                    # Prisma Client com adapter Postgres
  docs/
    swagger.ts                     # especificação OpenAPI
  generated/
    prisma/                        # Prisma Client gerado (não editar manualmente)
prisma/
  schema.prisma                    # schema Prisma Postgres
  migrations/                      # migrations Postgres
  seed.ts                          # carga inicial chamada por prisma db seed
  seed.json                        # dados da carga inicial
test/
  api/hosts.routes.test.ts         # testes de integração da API de hosts
  api/auth.routes.test.ts          # testes de integração da API de autenticação
  api/ping.test.ts                 # testes da lib de ping
  frontend/auth.vitest.test.js
  frontend/dashboard.vitest.test.js
  frontend/host.vitest.test.js
public/
  index.html                       # landing page pública
  login.html                       # login de usuário
  register.html                    # cadastro de usuário
  dashboard.html                   # listagem/cadastro de hosts após login
  host.html                        # detalhes, histórico e gráfico de latência
  js/
    navbar.js                      # renderização compartilhada do navbar
    session.js                     # sessão, logout, proteção e fetch autenticado
    auth-form.js                   # submit compartilhado de login/cadastro
```

## Endpoints atuais

| Método | Rota                   | Descrição                                 |
| ------ | ---------------------- | ----------------------------------------- |
| POST   | /api/auth/register     | cadastra usuário e retorna JWT            |
| POST   | /api/auth/login        | autentica usuário e retorna JWT           |
| POST   | /api/hosts             | cria host e executa ping inicial          |
| GET    | /api/hosts             | lista hosts                               |
| GET    | /api/hosts/:id         | retorna host por id                       |
| PUT    | /api/hosts/:id         | atualiza host                             |
| DELETE | /api/hosts/:id         | remove host                               |
| GET    | /api/hosts/:id/ping    | executa ping no host e registra histórico |
| GET    | /api/hosts/:id/details | retorna host + histórico + estatísticas   |
| GET    | /api/hosts/:id/history | retorna histórico de ping                 |
| GET    | /api/docs              | Swagger UI                                |
| GET    | /api/docs.json         | OpenAPI JSON                              |

## Convenções

- ES Modules com `type: module` no package.json e TypeScript com `moduleResolution NodeNext`.
- Erros de domínio ficam em `src/errors/`; `HttpError` padroniza respostas 4xx/5xx; `HostError` trata erros específicos de hosts.
- Utilitários puros (jwt, password, ping) ficam em `src/lib/`; não devem depender do Prisma.
- `app` exportado como default de `src/index.ts` para uso com supertest.
- Porta padrão da aplicação: 3000.
- Documentação em `/api/docs` (Swagger UI) e `/api/docs.json` (OpenAPI JSON).
- Status de host: `Unknown`, `Online`, `Offline`.
- Uptime representa disponibilidade percentual (0-100) baseada no histórico.
- Fluxo de frontend autenticado guarda `hostMonitorToken` e `hostMonitorUser` no `localStorage`.
- Scripts compartilhados de frontend ficam em `public/js`; evitar duplicar lógica inline nos HTMLs.
- Imports internos usam o alias `@/*` para apontar para `src/*`.
- Imports TypeScript usam extensão `.js`, compatível com a saída ESM em `dist`.
- O build executa `db:generate && tsc && tsc-alias` para gerar o client e reescrever `@/*` na saída compilada.
- Acesso ao banco deve usar Prisma Client (em `src/generated/prisma`), não SQL direto.

## Banco por ambiente

- Postgres é o único provider do Prisma (`provider = "postgresql"`).
- `.env` concentra portas expostas, credenciais/nome do Postgres, segredo JWT e credenciais do pgAdmin.
- `DATABASE_URL` é usada por padrão pela aplicação e pelo Prisma.
- Quando `DATABASE_URL` não está definida, ela é montada a partir de `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST` e `POSTGRES_PORT`.
- O Compose monta `DATABASE_URL` usando o service name Docker `postgres` como host; comandos locais usam `POSTGRES_HOST=localhost`.
- O Prisma Client é gerado em `src/generated/prisma/` via `npm run db:generate`. Sempre executar antes de `tsc`.
- O script de teste de API usa `POSTGRES_DB=host_monitor_test` e executa `db:drop` + `db:seed` antes dos testes (banco de teste é limpo a cada execução).

## Recomendações de uso da stack

### Express

- Handlers são `RequestHandler` do Express 5; erros assíncronos chegam ao `errorHandler` via `next(error)` ou `throw` direto (Express 5 propaga automaticamente em handlers `async`).
- Não lançar `HttpError` diretamente em rotas; controllers devem capturar erros de domínio e convertê-los com `mapHostError` ou equivalente antes de relançar.
- Middleware de validação (`validateRequest`) recebe schemas Zod separados para `params`, `query` e `body`; usar nas rotas antes dos controllers.
- `requireJsonContentType` deve ser aplicado em rotas que consomem corpo JSON.
- O handler `notFoundHandler` é registrado por último; `errorHandler` é o middleware de 4 parâmetros registrado após ele.

### Zod

- Schemas ficam em `src/schemas/`; exportar tanto o schema quanto os tipos inferidos (`z.infer`).
- Preferir `safeParse` dentro de middlewares (sem exceção); `parse` é aceitável em models quando a exceção é capturada e convertida.
- Não duplicar validação: se o middleware `validateRequest` já validou o body, o model não precisa revalidar os mesmos campos.

### Prisma

- Importar o client de `@/generated/prisma/client.js`; nunca de `@prisma/client` (o output é customizado).
- Rodar `npm run db:generate` sempre que o `schema.prisma` mudar — o client gerado em `src/generated/` reflete o schema atual.
- Erros `P2025` (registro não encontrado) devem ser capturados e convertidos para `HostNotFoundError` via `mapPrismaNotFound`.
- Preferir `Promise.all` para consultas independentes (ex.: estatísticas + último check) em vez de `await` sequencial.
- Não usar `$queryRaw`; toda leitura/escrita passa pelas APIs de modelo Prisma.

### Erros e domínio

- `HttpError(message, status?)` — erros HTTP com status padrão 400; usar para falhas de entrada ou regra de negócio que o cliente pode corrigir.
- `HostNotFoundError` / `InvalidHostError` — erros de domínio sem status HTTP; controllers os convertem para `HttpError` antes de lançar.
- Nunca lançar `Error` genérico em models; escolher o tipo de domínio adequado para que controllers e testes possam distinguir os casos.

### JWT e senha

- Emissão e verificação de token ficam exclusivamente em `src/lib/jwt.ts`; não replicar lógica em controllers.
- Hash e comparação de senha ficam em `src/lib/password.ts`; nunca armazenar senha em texto plano nem expô-la em respostas.
- O middleware de autenticação deve verificar o token via `src/lib/jwt.ts` e lançar `HttpError` com status 401 em caso de falha.

### Testes

- Testes de API usam `supertest` sobre o `app` exportado; não sobem um servidor real.
- Banco de teste é isolado por `POSTGRES_DB=host_monitor_test`; o script `test:api` faz `db:drop` + `db:seed` antes de cada execução.
- Testes de frontend usam Vitest + jsdom; não dependem do servidor Node.
- Não mockar o Prisma nos testes de API — testes batem no banco de teste real para garantir consistência com migrations.

## Workflow

- Validar alterações com testes aplicáveis antes de commit.
- Evitar misturar mudanças não relacionadas no mesmo commit.
- Manter AGENTS.md e README alinhados quando scripts/endpoints mudarem.
