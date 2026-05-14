# Hello API (Express)

API de exemplo para praticar conceitos de HTTP com Express:

- Rotas GET e POST
- Path parameter (`:name`)
- Query parameter (`?name=`)
- Body em JSON
- Tratamento de erro com status 400, 404 e 500

## Requisitos

- Node.js 18+
- npm

## Instalação

```bash
npm install
```

## Executar

Modo desenvolvimento (com watch):

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

## Testes

Executar a bateria de testes automatizados:

```bash
npm test
```

Servidor padrão:

- `http://localhost:3000`

Base da API:

- `http://localhost:3000/api`

## Swagger

Documentacao interativa:

- `http://localhost:3000/api/docs`

Especificacao OpenAPI em JSON:

- `http://localhost:3000/api/docs.json`

## Endpoints

| Metodo | Rota                | Parametros        | Sucesso | Erro comum                                   |
| ------ | ------------------- | ----------------- | ------- | -------------------------------------------- |
| GET    | /api/               | -                 | 200     | -                                            |
| GET    | /api/en             | -                 | 200     | -                                            |
| GET    | /api/pt             | -                 | 200     | -                                            |
| GET    | /api/hello/en/:name | path: name        | 200     | 404 se rota incompleta                       |
| GET    | /api/hello/pt       | query: name       | 200     | 400 se name ausente                          |
| POST   | /api/hello/es       | body: name (JSON) | 200     | 400 se Content-Type invalido ou name ausente |

### 1) GET /api/

Resposta esperada (`200`):

```json
{ "message": "Hello API" }
```

### 2) GET /api/en

Resposta esperada (`200`):

```json
{ "message": "Hello, World!" }
```

### 3) GET /api/pt

Resposta esperada (`200`):

```json
{ "message": "Olá, Mundo!" }
```

### 4) GET /api/hello/en/:name

Exemplo:

```http
GET /api/hello/en/John
```

Resposta esperada (`200`):

```json
{ "message": "Hello, John!" }
```

### 5) GET /api/hello/pt?name=John

Exemplo:

```http
GET /api/hello/pt?name=John
```

Resposta esperada (`200`):

```json
{ "message": "Olá, John!" }
```

Falha sem query string `name` (`400`):

```json
{ "error": "Name query parameter is required" }
```

### 6) POST /api/hello/es

Headers obrigatórios:

```http
Content-Type: application/json
```

Body:

```json
{ "name": "John" }
```

Resposta esperada (`200`):

```json
{ "message": "¡Hola, John!" }
```

Falhas comuns (`400`):

- `Content-Type` inválido:

```json
{ "error": "Content-Type must be application/json" }
```

- Campo `name` ausente no body:

```json
{ "error": "Name body parameter is required" }
```

## Tratamento de Erros

O projeto usa uma classe `HttpError` para erros de cliente, com status padrão `400`.

Fluxo:

- Erros lançados com `new HttpError(...)` retornam o status definido (ex.: `400`) com JSON no formato `{ "error": "..." }`.
- Rotas não encontradas em `/api/*` retornam `404` com `{ "error": "Not Found" }`.
- Erros inesperados retornam `500` com `{ "error": "Internal Server Error" }`.

## Testes Manuais com requests.http

Use o arquivo `requests.http` para executar as requisições rapidamente no VS Code.

Variável padrão:

```http
@server=http://localhost:3000
```
