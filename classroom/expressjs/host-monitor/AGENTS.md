# AGENTS.md - host-monitor

Aplicação de monitoramento de hosts construída com Express.js (JavaScript/ESM), SQLite e frontend estático.

## Comandos essenciais

```bash
npm install               # instalar dependências
npm run dev               # desenvolvimento com hot reload
npm start                 # execução padrão
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
  index.js                    # app Express e bootstrap HTTP (porta 3000)
  routes/hosts.js             # rotas da API de hosts
  models/Hosts.js             # regras de negócio e acesso a dados
  schemas/host.js             # schemas de validação (zod)
  middleware/                 # validações e tratamento de erro
  database/
    database.js               # conexão SQLite
    dbFile.js                 # seleção do arquivo por NODE_ENV
    migration.js              # criação de tabela
    seeders.js                # carga de dados
    drop.js                   # remoção do banco do ambiente atual
  docs/swagger.js             # especificação OpenAPI
test/
  api/hosts.routes.test.js    # testes de integração da API
  frontend/index.vitest.test.js
public/
  index.html                  # interface web
```

## Endpoints atuais

| Método | Rota                | Descrição            |
| ------ | ------------------- | -------------------- |
| POST   | /api/hosts          | cria host            |
| GET    | /api/hosts          | lista hosts          |
| PUT    | /api/hosts/:id      | atualiza host        |
| DELETE | /api/hosts/:id      | remove host          |
| GET    | /api/hosts/:id/ping | executa ping no host |
| GET    | /api/docs           | Swagger UI           |
| GET    | /api/docs.json      | OpenAPI JSON         |

## Convenções

- ES Modules com type module no package.json.
- HttpError e erros de domínio padronizam respostas 4xx/5xx.
- app exportado como default para uso com supertest.
- Porta padrão da aplicação: 3000.
- Documentação em /api/docs.

## Banco por ambiente

- NODE_ENV=test -> src/database/db.test.sqlite
- NODE_ENV=development -> src/database/db.dev.sqlite
- NODE_ENV=production -> src/database/db.sqlite

Observação: o script de teste de API limpa o banco de teste antes da execução.

## Workflow

- Validar alterações com testes aplicáveis antes de commit.
- Evitar misturar mudanças não relacionadas no mesmo commit.
- Manter AGENTS.md e README alinhados quando scripts/endpoints mudarem.
