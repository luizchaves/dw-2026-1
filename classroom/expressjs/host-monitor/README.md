# Host Monitor API

API de monitoramento de hosts construída com Express, TypeScript, Prisma, Postgres e frontend estático.

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

Paginas:

- `/`: landing page publica
- `/register.html`: cadastro de usuario
- `/login.html`: login de usuario
- `/dashboard.html`: dashboard de hosts apos login
- `/host.html?id=<id>`: detalhes do host apos login

Frontend estatico:

- `public/js/navbar.js`: renderizacao compartilhada do navbar publico e autenticado.
- `public/js/session.js`: sessao no `localStorage`, protecao de paginas autenticadas, logout e `fetchWithAuth`.
- `public/js/auth-form.js`: envio compartilhado dos formularios de login e cadastro.

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

Recria o banco Postgres configurado em `DATABASE_URL` usando Prisma Migrate e seed:

```bash
npm run db:reload
```

Configuracao:

- `.env`: concentra host/portas expostas, credenciais/nome do Postgres e `JWT_SECRET`.
- `DATABASE_URL`: é montada em runtime a partir de `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST` e `POSTGRES_PORT`; ainda pode ser definida manualmente como override.
- Testes locais usam `localhost:${POSTGRES_PORT}`; o container da aplicacao usa o host Docker `postgres`.
- `prisma/schema.prisma`: schema unico com provider `postgresql`.

JWT:

- `JWT_SECRET`: segredo usado para assinar tokens de cadastro/login.
- Senhas de usuario sao armazenadas apenas como hash em `password_hash`.

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

## MCP Host Monitor

O projeto inclui um servidor MCP via stdio para clientes como Codex, Claude Code e outros hosts compatíveis com Model Context Protocol.

Scripts:

```bash
npm run mcp:dev    # executa o MCP em TypeScript
npm run build
npm run mcp        # executa o MCP compilado em dist
```

Variaveis de ambiente:

- `HOST_MONITOR_API_URL`: URL base da API Express. Padrao: `http://localhost:3000`.
- `HOST_MONITOR_TOKEN`: JWT opcional usado nas chamadas para a API.

Ferramentas MCP expostas:

- `host_monitor_config`
- `host_monitor_openapi`
- `host_monitor_register`
- `host_monitor_login`
- `host_monitor_set_token`
- `host_monitor_list_hosts`
- `host_monitor_get_host`
- `host_monitor_create_host`
- `host_monitor_update_host`
- `host_monitor_delete_host`
- `host_monitor_ping_host`
- `host_monitor_get_host_details`
- `host_monitor_get_host_history`

Exemplo de configuracao para clientes MCP:

```json
{
  "mcpServers": {
    "host-monitor": {
      "command": "npm",
      "args": ["run", "mcp", "--silent"],
      "cwd": "/Users/lucachaves/code/subjects/dw-2026-1/classroom/expressjs/host-monitor",
      "env": {
        "HOST_MONITOR_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

Durante desenvolvimento, troque os argumentos por `["run", "mcp:dev", "--silent"]`. A API Express precisa estar em execucao (`npm run dev` ou `npm start`) para que as ferramentas MCP consigam consultar e alterar hosts.

## Endpoints

As rotas de hosts exigem JWT valido no header `Authorization: Bearer <token>`.

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

Desenvolvimento local:

```bash
docker compose up --build
```

Esse compose sobe a aplicacao em modo desenvolvimento com Postgres, hot reload via `Dockerfile.dev`, volume em `./src` e dados persistidos no volume `host_monitor_postgres_data`. Para build de produção da aplicação, use o `Dockerfile`.

## Testes Manuais

Use o arquivo `requests.http` para executar requisicoes rapidamente no VS Code.
