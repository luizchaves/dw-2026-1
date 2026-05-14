# AGENTS.md — hello-api

API de exemplo construída com Express.js (JavaScript/ESM).

## Comandos essenciais

```bash
npm install          # instalar dependências
npm run dev          # desenvolvimento com hot reload (node --watch)
npm start            # produção
npm test             # testes de integração
```

## Docker

```bash
# Produção
docker compose up --build

# Desenvolvimento (hot reload via volume)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Estrutura

```
src/
  index.js          # app Express, middlewares, listen na porta 3000
  routes.js         # endpoints da API
  errorHandlers.js  # handlers 404 e 500
  HttpError.js      # classe de erro customizado
  swagger.js        # especificação OpenAPI
test/
  api.test.js       # testes de integração com supertest
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

- ES Modules (`"type": "module"`)
- `HttpError` para erros de negócio (status 400 por padrão)
- `app` é exportado como `default` para facilitar testes com supertest
- Swagger disponível em `/api/docs` e `/api/docs.json`
- Porta padrão: `3000`

## Workflow

- Toda alteração ou nova feature deve ser automaticamente commitada após validação (build/testes aplicáveis).
