# AGENTS.md - host-monitor

Aplicação de monitoramento de hosts construída com Express.js (TypeScript/ESM), SQLite e frontend estático.

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
# Produção
docker compose up --build

# Desenvolvimento (com volume para src)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Estrutura relevante

```text
src/
  index.ts                    # app Express e bootstrap HTTP (porta 3000)
  routes/hosts.route.ts       # rotas da API de hosts
  models/Hosts.ts             # regras de negócio, histórico e estatísticas
  schemas/host.ts             # schemas de validação (zod)
  types.ts                    # contratos compartilhados da aplicação
  middleware/                 # validações e tratamento de erro
  database/
    database.ts               # conexão SQLite e seleção do arquivo por NODE_ENV
    migration.ts              # tabela hosts + tabela ping_checks
    seeders.ts                # carga de dados
  docs/swagger.ts             # especificação OpenAPI
test/
  api/hosts.routes.test.ts    # testes de integração da API
  frontend/index.vitest.test.js
  frontend/host.vitest.test.js
public/
  index.html                  # listagem/cadastro de hosts
  host.html                   # detalhes, histórico e gráfico de latência
```

## Endpoints atuais

| Método | Rota                   | Descrição                                 |
| ------ | ---------------------- | ----------------------------------------- |
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
- Imports relativos nos arquivos TypeScript usam extensão `.js`, compatível com a saída ESM em `dist`.

## Banco por ambiente

- NODE_ENV=test -> `src/database/db.test.sqlite` quando executado via `tsx`
- NODE_ENV=development -> `src/database/db.dev.sqlite` quando executado via `tsx`
- NODE_ENV=production -> `dist/database/db.sqlite` quando executado via build compilado

Observação: o script de teste de API limpa o banco de teste antes da execução.

## Workflow

- Validar alterações com testes aplicáveis antes de commit.
- Evitar misturar mudanças não relacionadas no mesmo commit.
- Manter AGENTS.md e README alinhados quando scripts/endpoints mudarem.
