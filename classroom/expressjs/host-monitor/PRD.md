# PRD - Host Monitor API + Frontend

## 1. Visão Geral

Host Monitor é uma aplicação web com API REST e interface web para cadastro, consulta, atualização, remoção e verificação de disponibilidade (ping) de hosts.

O produto atende um contexto educacional e de laboratório para praticar:

- desenvolvimento backend com Express
- persistência em SQLite
- validação de entrada
- testes de API e frontend
- documentação com OpenAPI/Swagger

## 2. Problema

Sem uma base única para requisitos, o projeto pode evoluir com comportamento inconsistente entre API, frontend, testes e ambiente de execução.

Também existe risco de mistura de dados entre desenvolvimento e testes quando ambos usam o mesmo banco.

## 3. Objetivos

1. Disponibilizar CRUD completo de hosts com validação.
2. Expor endpoint de ping por host para monitoramento básico.
3. Manter interface web simples para operações principais.
4. Garantir isolamento de banco por ambiente (`development`, `test`, `production`).
5. Assegurar cobertura funcional mínima via testes automatizados.

## 4. Escopo

### 4.1 Em escopo

- API REST para hosts.
- Endpoint de ping por host com parâmetro de contagem.
- Frontend web para listar e cadastrar hosts.
- Persistência local com SQLite.
- Documentação Swagger.
- Testes automatizados de API e frontend.
- Docker Compose para execução em desenvolvimento e produção.

### 4.2 Fora de escopo (nesta fase)

- Autenticação e autorização de usuários.
- Multi-tenant.
- Banco relacional externo (PostgreSQL/MySQL).
- Dashboard avançado de métricas históricas.
- Alertas (email, webhook, SMS).

## 5. Personas

1. Estudante de desenvolvimento web: precisa entender fluxo completo API + UI + testes.
2. Instrutor: precisa validar rapidamente funcionalidades e boas práticas.
3. Desenvolvedor iniciante: precisa de base clara para evolução incremental.

## 6. Requisitos Funcionais

### RF-01 - Criar host

- Método: `POST /api/hosts`
- Entrada: `name`, `address`, `category` (JSON)
- Saída: host criado com `id`, `status`, `uptime`

### RF-02 - Listar hosts

- Método: `GET /api/hosts`
- Saída: lista de hosts

### RF-03 - Atualizar host

- Método: `PUT /api/hosts/:id`
- Entrada: campos atualizáveis
- Saída: host atualizado

### RF-04 - Remover host

- Método: `DELETE /api/hosts/:id`
- Saída: `204 No Content`

### RF-05 - Consultar ping de host

- Método: `GET /api/hosts/:id/ping`
- Query opcional: `count`
- Saída: informações de pacotes e estatísticas de ping

### RF-06 - Validar erros de entrada

- Conteúdo inválido, host inexistente e falhas de negócio devem retornar JSON de erro com status adequado.

### RF-07 - Documentação da API

- Expor `GET /api/docs` e `GET /api/docs.json`.

### RF-08 - Interface web básica

- Renderizar hosts existentes.
- Permitir criação de host por formulário.

### RF-09 - Isolamento de banco por ambiente

- `NODE_ENV=test` -> `src/database/db.test.sqlite`
- `NODE_ENV=development` -> `src/database/db.dev.sqlite`
- `NODE_ENV=production` -> `src/database/db.sqlite`

## 7. Requisitos Não Funcionais

### RNF-01 - Qualidade

- Testes de API e frontend devem executar com sucesso via `npm test`.

### RNF-02 - Observabilidade básica

- Logs HTTP habilitados no servidor.

### RNF-03 - Portabilidade

- Projeto executável localmente com Node.js e via Docker Compose.

### RNF-04 - Consistência de ambiente

- Scripts de teste devem limpar banco de teste antes da execução.

### RNF-05 - Simplicidade de manutenção

- Código modular por camadas (rotas, modelos, middleware, database).

## 8. Regras de Negócio

1. Host precisa de identificador único.
2. Filtros de consulta aceitam apenas campos permitidos.
3. Ping só pode ser executado para host existente.
4. Erros de host não encontrado devem retornar mensagem consistente.

## 9. Fluxos Principais

### Fluxo A - Cadastro e visualização

1. Usuário abre a interface web.
2. Sistema carrega hosts existentes.
3. Usuário envia formulário de novo host.
4. API persiste host e retorna dados atualizados.
5. UI atualiza grade/listagem.

### Fluxo B - Validação de host

1. Usuário solicita ping de um host.
2. API valida existência do host.
3. API executa ping com `count` padrão ou informado.
4. API retorna pacotes e estatísticas.

## 10. Critérios de Aceite

1. CRUD de hosts funcional com códigos HTTP esperados.
2. Endpoint de ping funcionando para host válido e retornando erro para host inválido/inacessível.
3. Documentação Swagger acessível.
4. `npm run test:api` e `npm run test:front` com 100% dos testes existentes passando.
5. Testes não devem escrever em banco de desenvolvimento/produção.
6. Docker Compose de desenvolvimento e produção devem iniciar sem ajuste manual de banco.

## 11. Riscos e Mitigações

1. Risco: flakiness em testes de ping por dependência de rede/ICMP.

- Mitigação: manter casos deterministas e considerar mocks para cenário CI restrito.

2. Risco: crescimento do escopo sem controle.

- Mitigação: manter backlog priorizado por fases.

3. Risco: regressão em validações de entrada.

- Mitigação: ampliar testes de contrato da API.

## 12. Métricas de Sucesso

1. Taxa de sucesso dos testes em CI/local >= 95%.
2. Tempo médio para executar suíte completa de testes em ambiente local dentro de limite aceitável para feedback rápido.
3. Zero incidentes de contaminação entre banco de teste e banco de desenvolvimento.

## 13. Plano de Entrega (alto nível)

### Fase 1 - Base funcional (concluída)

- Estrutura API + CRUD + Swagger + testes iniciais.

### Fase 2 - Isolamento de ambientes (concluída)

- Seleção de banco por `NODE_ENV`.
- Limpeza automática do banco de teste.

### Fase 3 - Evolução sugerida

- Melhorias de UX no frontend.
- Cobertura de testes de cenários negativos.
- Pipeline CI com execução automática de testes.

## 14. Dependências

- Node.js
- npm
- SQLite (módulo nativo Node `node:sqlite`)
- Express, Zod, Supertest, Vitest
- Docker e Docker Compose (opcional para execução containerizada)

## 15. Stakeholders

- Time da disciplina/laboratório
- Estudantes
- Monitores e instrutores
