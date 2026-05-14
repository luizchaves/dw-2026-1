# Hello API TS (Express + TypeScript)

Versao em TypeScript do projeto `hello-api`.

## Requisitos

- Node.js 18+
- npm

## Instalacao

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm run dev
```

## Executar testes

```bash
npm test
```

## Build e execucao em producao

```bash
npm run build
npm start
```

## Endpoints principais

- `GET /api/`
- `GET /api/en`
- `GET /api/pt`
- `GET /api/hello/en/:name`
- `GET /api/hello/pt?name=John`
- `POST /api/hello/es`

## Swagger

- UI: `http://localhost:3000/api/docs`
- JSON: `http://localhost:3000/api/docs.json`

## Estrutura

- `src/index.ts`: cria o app, registra middlewares/rotas, exporta `default app`
- `src/routes.ts`: endpoints
- `src/errorHandlers.ts`: 404/400/500
- `src/HttpError.ts`: erro customizado
- `src/swagger.ts`: especificacao OpenAPI
- `test/api.test.ts`: bateria de testes de integracao
