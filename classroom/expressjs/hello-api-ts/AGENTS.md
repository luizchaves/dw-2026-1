# AGENTS.md — hello-api-ts

Versão TypeScript do `hello-api`, construída com Express.js + TypeScript/ESM.

## Comandos essenciais

```bash
npm install          # instalar dependências
npm run dev          # desenvolvimento com hot reload (tsx watch)
npm run build        # compilar TypeScript para dist/
npm start            # produção (requer build)
npm test             # testes de integração
```

## Docker

```bash
# Produção (multi-stage build: tsc → node dist/)
docker compose up --build

# Desenvolvimento (hot reload via volume + tsx watch)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Estrutura

```
src/
  index.ts          # app Express, middlewares, listen na porta 3000
  routes.ts         # endpoints da API
  errorHandlers.ts  # handlers 404 e 500
  HttpError.ts      # classe de erro customizado
  swagger.ts        # especificação OpenAPI
test/
  api.test.ts       # testes de integração com supertest
tsconfig.json       # compila src/ → dist/
```

## Endpoints

| Método | Rota                | Parâmetro         | 200 | Erro         |
| ------ | ------------------- | ----------------- | --- | ------------ |
| GET    | /api/               | -                 | ✓   | -            |
| GET    | /api/en             | -                 | ✓   | -            |
| GET    | /api/pt             | -                 | ✓   | -            |
| GET    | /api/hello/en/:name | path: `name`      | ✓   | 404          |
| GET    | /api/hello/pt       | query: `name`     | ✓   | 400 sem name |
| POST   | /api/hello/es       | body JSON: `name` | ✓   | 400 sem name |

## Convenções

- ES Modules (`"type": "module"`) com TypeScript
- `HttpError` para erros de negócio (status 400 por padrão)
- `app` é exportado como `default` para facilitar testes com supertest
- Tipos explícitos via `@types/express`, `@types/morgan` etc.
- Swagger disponível em `/api/docs` e `/api/docs.json`
- Porta padrão: `3000`

## Workflow

- Toda alteração ou nova feature deve ser automaticamente commitada após validação (build/testes aplicáveis).
