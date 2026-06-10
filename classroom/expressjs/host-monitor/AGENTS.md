# AGENTS.md - host-monitor

Aplicação de monitoramento de hosts construída com Express.js (TypeScript/ESM), Prisma, Postgres e frontend estático.

## Comandos essenciais

```bash
npm install               # instalar dependências
npm run dev               # desenvolvimento com hot reload
npm run build             # compila TypeScript para dist
npm start                 # execução padrão a partir de dist
npm run typecheck         # valida tipos sem emitir arquivos
npm test                  # roda testes de API + frontend
npm run test:api          # testes de API com NODE_ENV=test
npm run test:front        # testes de frontend (Vitest)
npm run db:reload         # recria banco do ambiente atual
```

## Docker

```bash
docker compose up --build # desenvolvimento local com Postgres
```

## Estrutura relevante

```text
src/
  index.ts                    # app Express e bootstrap HTTP (porta 3000)
  routes/hosts.route.ts       # rotas da API de hosts
  routes/auth.route.ts        # rotas de cadastro/login de usuários
  controllers/hosts.controller.ts # handlers HTTP da API de hosts
  controllers/auth.controller.ts # handlers HTTP de autenticação
  models/Hosts.ts             # regras de negócio, histórico e estatísticas
  models/Users.ts             # cadastro, login, hash de senha e emissão JWT
  schemas/host.ts             # schemas de validação (zod)
  types.ts                    # contratos compartilhados da aplicação
  middleware/                 # validações e tratamento de erro
  database/
    database.ts               # Prisma Client com adapter Postgres
prisma/
  schema.prisma               # schema Prisma Postgres
  migrations/                 # migrations Postgres
  seed.ts                     # carga inicial chamada por prisma db seed
  seed.json                   # dados da carga inicial
  docs/swagger.ts             # especificação OpenAPI
test/
  api/hosts.routes.test.ts    # testes de integração da API
  frontend/auth.vitest.test.js
  frontend/dashboard.vitest.test.js
  frontend/host.vitest.test.js
public/
  index.html                  # landing page pública
  login.html                  # login de usuário
  register.html               # cadastro de usuário
  dashboard.html              # listagem/cadastro de hosts após login
  host.html                   # detalhes, histórico e gráfico de latência
  js/
    navbar.js                 # renderização compartilhada do navbar
    session.js                # sessão, logout, proteção e fetch autenticado
    auth-form.js              # submit compartilhado de login/cadastro
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

- ES Modules com type module no package.json e TypeScript com moduleResolution NodeNext.
- HttpError e erros de domínio padronizam respostas 4xx/5xx.
- app exportado como default para uso com supertest.
- Porta padrão da aplicação: 3000.
- Documentação em /api/docs.
- Status de host: Unknown, Online, Offline.
- Uptime representa disponibilidade percentual (0-100) baseada no histórico.
- Fluxo de frontend autenticado guarda `hostMonitorToken` e `hostMonitorUser` no `localStorage`.
- Scripts compartilhados de frontend ficam em `public/js`; evitar duplicar lógica inline nos HTMLs.
- Imports internos usam o alias `@/*` para apontar para `src/*`.
- Imports TypeScript ainda usam extensão `.js`, compatível com a saída ESM em `dist`.
- O build executa `tsc && tsc-alias` para reescrever `@/*` na saída compilada.
- Acesso ao banco deve usar Prisma Client, não SQL direto.

## Banco por ambiente

- Postgres é o único provider do Prisma (`provider = "postgresql"`).
- `.env` concentra portas expostas, credenciais/nome do Postgres e segredo JWT.
- `DATABASE_URL` é usada por padrão pela aplicação e pelo Prisma.
- Quando `DATABASE_URL` não está definida, ela é montada a partir de `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST` e `POSTGRES_PORT`.
- O Compose monta `DATABASE_URL` usando o host Docker `postgres`; comandos locais usam `localhost:${POSTGRES_PORT}`.

Observação: o script de teste de API limpa o banco configurado antes da execução.

## Workflow

- Validar alterações com testes aplicáveis antes de commit.
- Evitar misturar mudanças não relacionadas no mesmo commit.
- Manter AGENTS.md e README alinhados quando scripts/endpoints mudarem.
