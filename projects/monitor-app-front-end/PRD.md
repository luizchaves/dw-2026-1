# PRD — Host Monitor

## 1. Visão Geral

O **Host Monitor** é um sistema web para cadastro e monitoramento de hosts (servidores, sites, APIs, dispositivos de rede) em termos de **disponibilidade** (online/offline) e **latência** (tempo de resposta). O sistema realiza verificações periódicas via ICMP Ping e exibe estatísticas e históricos de cada host monitorado.

## 2. Objetivos

- Permitir cadastro e autenticação de usuários para acesso ao sistema.
- Permitir o cadastro, edição e remoção de hosts a serem monitorados.
- Verificar periodicamente a disponibilidade e latência dos hosts.
- Exibir o status atual de cada host em um painel (dashboard).
- Apresentar estatísticas consolidadas (uptime, latência média, mín, máx).
- Manter e exibir o histórico de verificações com filtros por período.
- Notificar o usuário quando um host ficar indisponível ou voltar ao ar.

## 3. Público-Alvo

Administradores de sistemas, desenvolvedores e equipes de infraestrutura que precisam acompanhar a saúde de seus serviços e servidores.

## 4. Funcionalidades

### 4.1 Landing Page

Página pública inicial do sistema (`index.html`) com objetivo de apresentar o produto e converter visitantes em usuários:

- **Navbar pública**: logo do sistema + links "Entrar" e "Criar conta".
- **Hero**: headline, descrição, CTA principal (cadastro) e preview mockup do dashboard.
- **Features**: grid com 6 cards descrevendo os recursos (dashboard, estatísticas, alertas, histórico, incidentes, tags).
- **Como Funciona**: 3 passos numerados (cadastrar hosts → configurar intervalo → acompanhar em tempo real).
- **Social Proof / Números**: métricas de destaque (500+ hosts, 10k+ verificações/dia, 99.9% uptime, <1s detecção).
- **Screenshots**: previews miniatura das 3 telas principais (dashboard, estatísticas, incidentes).
- **Comparativo Antes/Depois**: lado a lado mostrando cenário sem monitoramento vs. com Host Monitor.
- **Integrações**: cards com canais de notificação suportados (e-mail, Slack, Discord, webhooks).
- **Planos e Preços**: 3 cards comparativos (Gratuito, Pro, Enterprise) com limites e funcionalidades.
- **Depoimentos**: 3 cards com citações de usuários fictícios e suas funções.
- **FAQ**: 6 perguntas frequentes com accordions (protocolos, intervalos, exportação, notificações, status page, MTTR).
- **CTA final**: chamada para ação com fundo indigo + botões de cadastro e login.
- **Footer**: logo, newsletter (campo de e-mail) e copyright.

### 4.2 Controle de Acesso

#### 4.1.1 Cadastro de Usuário (Sign Up)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `name` | string | sim | Nome completo do usuário |
| `email` | string | sim | E-mail (usado como login) |
| `password` | string | sim | Senha (mín. 8 caracteres) |
| `confirmPassword` | string | sim | Confirmação da senha |

#### 4.1.2 Login

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `email` | string | sim | E-mail cadastrado |
| `password` | string | sim | Senha do usuário |

- Após login, o usuário é redirecionado ao dashboard.
- Sessão autenticada via token JWT.
- Páginas administrativas são protegidas — acesso somente com sessão ativa.

#### 4.1.3 Navbar Administrativa

Todas as páginas internas (dashboard, detalhes, cadastro/edição de host) exibem uma navbar fixa com:

- **Logo e nome** do sistema (link para o dashboard).
- **Menu de navegação**: Dashboard, Estatísticas, Incidentes.
- **Avatar do usuário** com dropdown contendo:
  - Nome e e-mail do usuário logado.
  - Link para "Sair" (logout), que encerra a sessão e redireciona ao login.

### 4.3 Cadastro de Hosts (CRUD)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `name` | string | sim | Nome amigável do host (ex.: "Servidor Web") |
| `address` | string | sim | Endereço IP ou domínio (ex.: `192.168.0.1`, `example.com`) |
| `tags` | string[] | não | Etiquetas para agrupamento (ex.: "produção", "banco de dados") |
| `interval` | number | não | Intervalo de verificação em minutos (padrão: 5) |
| `active` | boolean | não | Habilitar/desabilitar o monitoramento (padrão: true) |

**Operações:**

- **Criar** — formulário para adicionar um novo host.
- **Listar** — tabela/grid com todos os hosts cadastrados, mostrando status atual.
- **Editar** — alterar dados de um host existente.
- **Remover** — excluir um host (com confirmação).

### 4.4 Dashboard

Painel principal exibindo todos os hosts monitorados com:

- **Card por host** contendo: nome, endereço, status (🟢 Online / 🔴 Offline), latência atual, uptime (%).
- **Resumo geral**: total de hosts, quantidade online, quantidade offline.
- **Filtros**: por tag, por status (online/offline/todos), busca por nome.
- **Ordenação**: por nome, latência, uptime.

### 4.5 Estatísticas por Host

Ao selecionar um host, exibir:

| Métrica | Descrição |
| --- | --- |
| Uptime (%) | Percentual de disponibilidade no período selecionado |
| Latência média | Tempo médio de resposta (ms) |
| Latência mínima | Menor tempo de resposta registrado (ms) |
| Latência máxima | Maior tempo de resposta registrado (ms) |
| Total de verificações | Quantidade de pings realizados |
| Total de falhas | Quantidade de vezes que o host ficou indisponível |

- Gráfico de linha da latência ao longo do tempo.
- Gráfico de disponibilidade (timeline de status: online/offline).
- Seletor de período: últimas 1h, 6h, 24h, 7d, 30d, personalizado.

### 4.6 Histórico de Verificações

Tabela de log com todas as verificações realizadas para um host:

| Coluna | Descrição |
| --- | --- |
| Data/Hora | Timestamp da verificação |
| Status | Online / Offline |
| Latência | Tempo de resposta em ms (ou `—` se offline) |
| Tipo | ICMP / HTTP |

- Paginação e filtros por período e por status.
- Exportação em CSV.

### 4.7 Estatísticas Globais

Página dedicada com visão consolidada de todos os hosts:

- **Resumo numérico**: total de hosts, online, offline, uptime médio, latência média, total de incidentes.
- **Seletor de período**: 1h, 6h, 24h, 7d, 30d.
- **Gráficos**:
  - Disponibilidade por host (pizza).
  - Latência média por host (barras comparativas).
  - Incidentes ao longo do tempo (linha).
  - Latência geral ao longo do tempo (linha).
- **Ranking de hosts**: tabela ordenada por uptime com colunas de endereço, uptime, latência média, falhas e status.

### 4.8 Análise de Incidentes

Página dedicada ao registro e análise de mudanças de status (online → offline) dos hosts:

- **Resumo numérico**: total de incidentes, abertos agora, resolvidos, tempo médio de resolução.
- **Gráfico de incidentes por dia** (barras) com seletor de período (7d, 30d, 90d).
- **Filtros**: busca por host, status do incidente (aberto/resolvido), período.
- **Tabela de histórico de incidentes** com colunas:

| Coluna | Descrição |
| --- | --- |
| Status | Aberto (em andamento) ou Resolvido |
| Host | Nome e endereço do host afetado |
| Início | Data/hora de início da indisponibilidade |
| Fim | Data/hora de retorno (ou "—" se ainda aberto) |
| Duração | Tempo total de indisponibilidade |
| Causa | Tipo de falha (timeout, host inacessível, alta latência) |

- **Hosts mais afetados**: cards com ranking dos hosts com mais incidentes, mostrando total de incidentes, tempo total fora e barra de proporção.
- Paginação na tabela de incidentes.
- Exportação em CSV.

### 4.9 Notificações

- Alerta visual no dashboard quando um host muda de status (online → offline ou vice-versa).
- Badge com contador de hosts offline.
- Histórico de eventos de mudança de status.

## 5. Wireframes

### 5.1 Login

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    HOST MONITOR                          │
│                                                          │
│              ┌──────────────────────┐                    │
│              │  Entrar na sua conta  │                    │
│              ├──────────────────────┤                    │
│              │  E-mail:             │                    │
│              │  [________________]  │                    │
│              │  Senha:              │                    │
│              │  [________________]  │                    │
│              │                      │                    │
│              │  [    Entrar     ]   │                    │
│              │                      │                    │
│              │  Não tem conta?       │                    │
│              │  Cadastre-se          │                    │
│              └──────────────────────┘                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Cadastro de Usuário

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    HOST MONITOR                          │
│                                                          │
│              ┌──────────────────────┐                    │
│              │  Criar sua conta      │                    │
│              ├──────────────────────┤                    │
│              │  Nome:               │                    │
│              │  [________________]  │                    │
│              │  E-mail:             │                    │
│              │  [________________]  │                    │
│              │  Senha:              │                    │
│              │  [________________]  │                    │
│              │  Confirmar senha:    │                    │
│              │  [________________]  │                    │
│              │                      │                    │
│              │  [   Cadastrar   ]   │                    │
│              │                      │                    │
│              │  Já tem conta?        │                    │
│              │  Faça login           │                    │
│              └──────────────────────┘                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 5.3 Dashboard

```
┌──────────────────────────────────────────────────────────┐
│  HOST MONITOR  [Dashboard] [Estatísticas] [Incidentes]  (avatar) João ▾  │
│                                       ┌────────────┐     │
│                                       │ João Silva │     │
│                                       │ j@mail.com │     │
│                                       │ ─────────  │     │
│                                       │ Sair       │     │
│                                       └────────────┘     │
├──────────────────────────────────────────────────────────┤
│                                       [+ Novo Host]      │
├──────────────────────────────────────────────────────────┤
│  Total: 12    🟢 Online: 10    🔴 Offline: 2            │
├──────────────────────────────────────────────────────────┤
│  [Buscar...]  [Tag: todas ▾]  [Status: todos ▾]         │
├──────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ 🟢 Srv Web  │  │ 🟢 API Rest │  │ 🔴 DB Main  │      │
│  │ 192.168.0.1 │  │ api.ex.com  │  │ 10.0.0.5    │      │
│  │ 12ms        │  │ 45ms        │  │ ---         │      │
│  │ ↑ 99.8%     │  │ ↑ 99.2%     │  │ ↑ 94.1%     │      │
│  │ [Ver mais]  │  │ [Ver mais]  │  │ [Ver mais]  │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└──────────────────────────────────────────────────────────┘
```

### 5.4 Detalhes / Estatísticas do Host

```
┌──────────────────────────────────────────────────────────┐
│  ← Voltar       Servidor Web — 192.168.0.1     [Editar] │
├──────────────────────────────────────────────────────────┤
│  Status: 🟢 Online    Latência: 12ms    Uptime: 99.8%   │
├──────────────────────────────────────────────────────────┤
│  Período: [1h] [6h] [24h] [7d] [30d] [Personalizado]    │
├──────────────────────────────────────────────────────────┤
│  Latência (ms)                                           │
│  50│        ╱╲                                           │
│  25│  ──╱──╱  ╲──╲──                                     │
│   0│──────────────────→ tempo                            │
├──────────────────────────────────────────────────────────┤
│  HISTÓRICO DE VERIFICAÇÕES                [Exportar CSV] │
│  ┌──────────┬──────────┬──────────┬──────┐               │
│  │ Data/Hora│ Status   │ Latência │ Tipo │               │
│  ├──────────┼──────────┼──────────┼──────┤               │
│  │ 12:05:00 │ 🟢 Online│ 12ms     │ ICMP │               │
│  │ 12:00:00 │ 🟢 Online│ 15ms     │ ICMP │               │
│  │ 11:55:00 │ 🔴 Off   │ —        │ ICMP │               │
│  └──────────┴──────────┴──────────┴──────┘               │
│  [← Anterior]                    [Próxima →]             │
└──────────────────────────────────────────────────────────┘
```

### 5.5 Incidentes

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HOST MONITOR  [Dashboard] [Estatísticas] [Incidentes]  (avatar) João ▾ │
├──────────────────────────────────────────────────────────────────────────┤
│  Incidentes                                                             │
│  Registro de mudanças de status e análise de indisponibilidades         │
├──────────────────────────────────────────────────────────────────────────┤
│  Total: 8     Abertos: 2     Resolvidos: 6     MTTR: 14min              │
├──────────────────────────────────────────────────────────────────────────┤
│  Incidentes por Dia                      Período: [7d] [30d] [90d]      │
│  █ █ ██ █ █  ██ █   (gráfico de barras)                                 │
├──────────────────────────────────────────────────────────────────────────┤
│  [Buscar host...]  [Status: todos ▾]  [Período: última semana ▾]        │
├──────────────────────────────────────────────────────────────────────────┤
│  Histórico de Incidentes                            [Exportar CSV]      │
│  ┌────────┬──────────────┬────────────────┬──────────────┬───────┬──────┐│
│  │ Status │ Host         │ Início         │ Fim          │Duração│Causa ││
│  ├────────┼──────────────┼────────────────┼──────────────┼───────┼──────┤│
│  │🔴Aberto│ DB Principal │ 12/03 10:45    │ —            │1h20min│Timeout│
│  │🔴Aberto│ SMTP Server  │ 12/03 09:30    │ —            │2h35min│Inaces│
│  │🟢Resolv│ Servidor Web │ 12/03 11:45    │ 12/03 11:50  │ 5min  │Timeout│
│  │🟢Resolv│ API REST     │ 11/03 14:20    │ 11/03 14:38  │18min  │Latênc│
│  └────────┴──────────────┴────────────────┴──────────────┴───────┴──────┘│
│  [← Anterior]                                       [Próxima →]         │
├──────────────────────────────────────────────────────────────────────────┤
│  Hosts Mais Afetados                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │ SMTP Server  │  │ DB Principal │  │ API REST     │                   │
│  │ 🔴 Offline    │  │ 🔴 Offline    │  │ 🟢 Online     │                   │
│  │ 3 incidentes │  │ 3 incidentes │  │ 2 incidentes │                   │
│  │ 3h19min fora │  │ 1h35min fora │  │ 23min fora   │                   │
│  │ ████████░░░  │  │ ████████░░░  │  │ █████░░░░░░  │                   │
│  │ 37.5%        │  │ 37.5%        │  │ 25%          │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└──────────────────────────────────────────────────────────────────────────┘
```

## 6. Modelo de Dados

### User

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@mail.com",
  "password": "$2b$10$hash...",
  "createdAt": "2026-03-01T08:00:00Z"
}
```

### Host

```json
{
  "id": 1,
  "name": "Servidor Web",
  "address": "192.168.0.1",
  "tags": ["produção", "web"],
  "interval": 5,
  "active": true,
  "createdAt": "2026-03-01T10:00:00Z",
  "updatedAt": "2026-03-10T08:30:00Z"
}
```

### Ping Result (Verificação)

```json
{
  "id": 1,
  "hostId": 1,
  "timestamp": "2026-03-12T12:05:00Z",
  "status": "online",
  "latency": 12,
  "type": "icmp"
}
```

### Host Stats (calculado)

```json
{
  "hostId": 1,
  "period": "24h",
  "uptime": 99.8,
  "avgLatency": 18.5,
  "minLatency": 8,
  "maxLatency": 52,
  "totalChecks": 288,
  "totalFailures": 1
}
```

## 7. API Endpoints (REST)

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/auth/signup` | Cadastrar novo usuário |
| `POST` | `/auth/login` | Autenticar usuário (retorna token JWT) |
| `GET` | `/hosts` | Listar todos os hosts (suporta filtros por tag, status) |
| `POST` | `/hosts` | Cadastrar novo host |
| `GET` | `/hosts/:id` | Obter detalhes de um host |
| `PUT` | `/hosts/:id` | Atualizar um host |
| `DELETE` | `/hosts/:id` | Remover um host |
| `GET` | `/hosts/:id/stats?period=24h` | Estatísticas do host no período |
| `GET` | `/hosts/:id/pings?page=1&limit=20` | Histórico de verificações (paginado) |
| `GET` | `/hosts/:id/pings/export?format=csv` | Exportar histórico em CSV |
| `GET` | `/stats?period=24h` | Estatísticas globais de todos os hosts |
| `GET` | `/incidents?page=1&limit=20&status=open&period=30d` | Listar incidentes com filtros |
| `GET` | `/incidents/summary?period=30d` | Resumo de incidentes (total, abertos, resolvidos, MTTR) |
| `GET` | `/incidents/export?format=csv` | Exportar incidentes em CSV |

## 8. Requisitos Não Funcionais

- **Responsividade**: layout adaptável para desktop, tablet e mobile.
- **Performance**: dashboard deve carregar em menos de 2 segundos.
- **Acessibilidade**: semântica HTML adequada, contraste de cores WCAG AA.
- **UX**: feedback visual ao criar/editar/remover hosts, estados de loading e empty states.

## 9. Stack Sugerida (Front-end)

| Camada | Tecnologia |
| --- | --- |
| Estrutura | HTML5 semântico |
| Estilização | Tailwind CSS |
| Interatividade | JavaScript (Vanilla ou framework leve) |
| Gráficos | Chart.js ou similar |
| Ícones | Lucide Icons |

## 10. Fases de Entrega

| Fase | Escopo | Entrega |
| --- | --- | --- |
| 1 | Layout HTML/CSS: login, cadastro, dashboard, detalhes, estatísticas e incidentes | Estrutura e estilo |
| 2 | Autenticação (signup/login) e controle de sessão | Controle de acesso |
| 3 | CRUD de hosts com dados mockados (JSON local) | Formulários e listagem |
| 4 | Integração com API REST (fetch/axios) | Dados reais |
| 5 | Gráficos de latência e disponibilidade | Visualizações |
| 6 | Notificações, exportação CSV e refinamentos | Funcionalidades extras |
