# Host Monitor API

API de monitoramento de hosts construída com Express, TypeScript, Prisma, SQLite e frontend estático.

## Requisitos

- Node.js 22+
- npm

## Instalação

```bash
npm install
```

## Desenvolvimento

Executa o servidor TypeScript com watch:

```bash
npm run dev
```

Servidor padrão:

- `http://localhost:3000`

Base da API:

- `http://localhost:3000/api`

## Build e Produção

Gera Prisma Client e compila `src/**/*.ts` para `dist/**/*.js`:

```bash
npm run build
```

Executa a versão compilada:

```bash
npm start
```

## Banco de Dados

Recria o banco SQLite do ambiente atual usando Prisma Migrate e seed:

```bash
npm run db:reload
```

Arquivos por ambiente:

- test: `src/database/db.test.sqlite`
- development: `src/database/db.dev.sqlite`
- production local compilado: `dist/database/db.sqlite`

JWT:

- `JWT_SECRET`: segredo usado para assinar tokens de cadastro/login.

## Testes

Executa typecheck, testes de API e testes de frontend:

```bash
npm test
```

Também é possível rodar separadamente:

```bash
npm run typecheck
npm run test:api
npm run test:front
```

## Swagger

Documentacao interativa:

- `http://localhost:3000/api/docs`

Especificacao OpenAPI em JSON:

- `http://localhost:3000/api/docs.json`

## Endpoints

| Metodo | Rota                   | Descricao                                 |
| ------ | ---------------------- | ----------------------------------------- |
| POST   | /api/auth/register     | Cadastra usuario e retorna JWT            |
| POST   | /api/auth/login        | Autentica usuario e retorna JWT           |
| POST   | /api/hosts             | Cria host e executa ping inicial          |
| GET    | /api/hosts             | Lista hosts                               |
| GET    | /api/hosts/:id         | Retorna host por id                       |
| PUT    | /api/hosts/:id         | Atualiza host                             |
| DELETE | /api/hosts/:id         | Remove host                               |
| GET    | /api/hosts/:id/ping    | Executa ping no host e registra historico |
| GET    | /api/hosts/:id/details | Retorna host, historico e estatisticas    |
| GET    | /api/hosts/:id/history | Retorna historico de ping                 |

## Docker

Producao:

```bash
docker compose up --build
```

Desenvolvimento:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Testes Manuais

Use o arquivo `requests.http` para executar requisicoes rapidamente no VS Code.
