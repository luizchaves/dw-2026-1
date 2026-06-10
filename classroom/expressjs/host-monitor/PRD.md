# PRD - Host Monitor API + Frontend

## 1. Visão Geral

Host Monitor é uma aplicação web com API REST e frontend estático autenticado para cadastro de usuários, login, cadastro de hosts, verificação de disponibilidade e visualização de histórico e estatísticas de ping.

O produto atende um contexto educacional para prática de:

- backend com Express
- persistência com SQLite
- validação de payload com Zod
- testes automatizados de API e frontend
- documentação OpenAPI/Swagger
- autenticação com JWT e senha armazenada como hash

## 2. Problema

Sem centralização de requisitos, a evolução do projeto pode gerar inconsistência entre API, frontend e testes.

Também há risco de decisões frágeis de monitoramento quando não existe histórico de disponibilidade por host.

## 3. Objetivos

1. Disponibilizar CRUD de hosts com validação.
2. Coletar disponibilidade real por ping (incluindo no momento da criação do host).
3. Expor histórico de verificações e estatísticas agregadas de disponibilidade.
4. Oferecer página de detalhes com histórico tabular, gráfico de latência e ação manual de ping.
5. Manter isolamento de banco por ambiente (`development`, `test`, `production`).
6. Exigir cadastro/login antes de acessar dashboard e detalhes de hosts.

## 4. Escopo

### 4.1 Em escopo

- API REST para hosts.
- Ping por host com persistência de histórico.
- Estatísticas de disponibilidade e latência agregadas por host.
- Frontend com:
  - landing page pública
  - cadastro e login de usuário
  - listagem e cadastro de hosts
  - página de detalhes por host
  - histórico de ping
  - gráfico de latência/disponibilidade
  - ação manual de nova verificação
- Scripts compartilhados de frontend para navbar, sessão e envio de formulários de autenticação.
- Cadastro/login com JWT.
- Documentação Swagger.
- Testes automatizados de API e frontend.

### 4.2 Fora de escopo (nesta fase)

- Alertas automáticos (email/webhook/SMS).
- Multi-tenant.
- Banco externo (PostgreSQL/MySQL).
- Histórico de longo prazo com retenção configurável.
- Controle de autorização por host/usuário.

## 5. Personas

1. Estudante de web backend/frontend: precisa entender fluxo completo API + UI + testes.
2. Instrutor/monitor: precisa validar comportamento de disponibilidade e qualidade.
3. Desenvolvedor iniciante: precisa de base simples para evoluir funcionalidades.

## 6. Requisitos Funcionais

### RF-01 - Criar host com check inicial

- Método: `POST /api/hosts`
- Entrada: `name`, `address`, `category` (JSON)
- Saída: host criado com `id`, `status`, `uptime`, `lastCheckedAt`
- Regra: após criar, o sistema executa ping inicial e persiste o resultado no histórico.

### RF-02 - Listar hosts

- Método: `GET /api/hosts`
- Saída: lista com status e uptime atuais de cada host.

### RF-03 - Buscar host por ID

- Método: `GET /api/hosts/:id`
- Saída: dados completos do host.

### RF-04 - Atualizar host

- Método: `PUT /api/hosts/:id`
- Entrada: campos editáveis (`name`, `address`, `category`)
- Saída: host atualizado.

### RF-05 - Remover host

- Método: `DELETE /api/hosts/:id`
- Saída: `204 No Content`.

### RF-06 - Executar ping manual

- Método: `GET /api/hosts/:id/ping`
- Query opcional: `count`
- Saída: resultado de ping + metadados de disponibilidade
- Regra: toda execução de ping deve persistir um novo registro de histórico e atualizar status/uptime do host.

### RF-07 - Consultar detalhes completos

- Método: `GET /api/hosts/:id/details`
- Saída:
  - host
  - estatísticas agregadas (`totalChecks`, `availability`, latências)
  - histórico recente de ping.

### RF-08 - Consultar histórico de ping

- Método: `GET /api/hosts/:id/history`
- Saída: lista de checks com data, sucesso/falha, métricas e erro.

### RF-09 - Documentação da API

- Endpoints:
  - `GET /api/docs`
  - `GET /api/docs.json`

### RF-10 - Cadastro de usuário

- Método: `POST /api/auth/register`
- Entrada: `name`, `email`, `password`, `passwordConfirmation` (JSON)
- Saída: usuário sem senha/hash + token JWT.
- Regra: senha deve ser armazenada somente como hash.

### RF-11 - Login de usuário

- Método: `POST /api/auth/login`
- Entrada: `email`, `password` (JSON)
- Saída: usuário sem senha/hash + token JWT.
- Regra: credenciais inválidas retornam erro sem revelar qual campo falhou.

### RF-12 - Frontend público e autenticação

- Landing page pública em `/`.
- Cadastro em `/register.html`.
- Login em `/login.html`.
- Usuário autenticado é redirecionado para `/dashboard.html`.
- Dashboard e detalhes exigem token no `localStorage`.

### RF-13 - Frontend de listagem

- Dashboard deve:
  - listar hosts
  - abrir modal de criação
  - permitir remoção
  - navegar para detalhes por host.

### RF-14 - Frontend de detalhes

- Página de host deve:
  - mostrar dados principais (status, uptime, checks, último check)
  - executar verificação manual de disponibilidade
  - exibir histórico tabular
  - exibir gráfico de latência/disponibilidade.

## 7. Requisitos Não Funcionais

### RNF-01 - Qualidade

- `npm run test:api` e `npm run test:front` devem passar.

### RNF-02 - Observabilidade básica

- Logs HTTP habilitados com morgan.

### RNF-03 - Portabilidade

- Execução local com Node.js e containerizada via Docker Compose.

### RNF-04 - Consistência de ambientes

- Banco segregado por `NODE_ENV`.
- Testes de API limpam banco de teste antes de executar.

### RNF-05 - Manutenibilidade

- Código modular por camadas (rotas, modelo, middleware, database, docs, tests).
- Lógica compartilhada do frontend deve ficar em `public/js` quando usada por mais de uma página.

## 8. Regras de Negócio

1. Cada host possui ID único.
2. Status permitido de host: `Unknown`, `Online`, `Offline`.
3. Uptime é disponibilidade percentual (0 a 100), derivada do histórico de checks.
4. Ping para host inexistente deve retornar erro de domínio.
5. Falha de ping em host existente deve registrar check offline no histórico.
6. Cadastro de usuário deve rejeitar confirmação de senha divergente.
7. Email de usuário deve ser único.
8. Respostas de autenticação não devem expor senha nem hash da senha.

## 9. Fluxos Principais

### Fluxo A - Cadastro/login de usuário

1. Usuário acessa a landing page.
2. Usuário cria conta em `/register.html` ou entra em `/login.html`.
3. API retorna JWT e dados públicos do usuário.
4. Frontend salva sessão e direciona para `/dashboard.html`.

### Fluxo B - Cadastro de host com disponibilidade inicial

1. Usuário autenticado cadastra host no dashboard.
2. API cria host.
3. API executa ping inicial automaticamente.
4. API registra histórico inicial e atualiza status/uptime.
5. Frontend exibe host já com estado atualizado.

### Fluxo C - Verificação manual em detalhes

1. Usuário abre página de detalhes do host.
2. Frontend carrega `/details` (host + histórico + estatísticas).
3. Usuário clica em verificar disponibilidade.
4. API executa ping e persiste novo check.
5. Frontend recarrega detalhes, tabela e gráfico.

## 10. Critérios de Aceite

1. Cadastro de host dispara ping inicial automaticamente.
2. Endpoints `/details` e `/history` retornam payload conforme contrato.
3. Página de detalhes exibe histórico e gráfico sem erro para host válido.
4. Botão de verificação manual atualiza dados após execução.
5. Listagem mantém link de detalhes e ação de remoção por card.
6. Login e cadastro salvam sessão e redirecionam para dashboard.
7. Dashboard e detalhes redirecionam para login quando não há token.
8. `npm run test:api` e `npm run test:front` passam integralmente.

## 11. Riscos e Mitigações

1. Risco: lentidão de testes com hosts indisponíveis.

- Mitigação: manter cenários mínimos e usar endereços estáveis para casos de sucesso.

2. Risco: divergência entre contrato da API e frontend.

- Mitigação: reforçar testes de integração e atualizar Swagger junto com mudanças.

3. Risco: crescimento de histórico impactar performance no SQLite.

- Mitigação: índice por `host_id` e `checked_at` + paginação/limite por query.

## 12. Métricas de Sucesso

1. Taxa de sucesso da suíte automatizada >= 95%.
2. Zero contaminação entre banco de teste e banco de desenvolvimento.
3. Disponibilidade e histórico exibidos de forma consistente após cada ping manual.

## 13. Plano de Entrega (alto nível)

### Fase 1 - Base CRUD + docs + testes (concluída)

- API de hosts
- frontend básico de listagem/cadastro
- Swagger e testes iniciais

### Fase 2 - Banco por ambiente (concluída)

- mapeamento por `NODE_ENV`
- limpeza automática do banco de teste

### Fase 3 - Monitoramento por host (concluída)

- histórico de ping (`ping_checks`)
- status/uptime derivados
- endpoints de details/history
- página de detalhes com tabela e gráfico

### Fase 4 - Autenticação e fluxo de frontend (concluída)

- cadastro/login de usuário
- emissão de JWT
- senha armazenada com hash
- landing page pública
- dashboard e detalhes após login
- scripts compartilhados em `public/js`

### Fase 5 - Evolução sugerida

- filtros avançados e ordenação na UI
- retenção de histórico configurável
- pipeline CI com execução automática de testes

## 14. Dependências

- Node.js
- npm
- Prisma Client com SQLite
- Express, Zod, Supertest, Vitest
- Docker e Docker Compose

## 15. Stakeholders

- Time da disciplina/laboratório
- Estudantes
- Monitores e instrutores
