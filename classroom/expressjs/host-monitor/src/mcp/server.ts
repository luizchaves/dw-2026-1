#!/usr/bin/env node
import 'dotenv/config';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const DEFAULT_API_URL = 'http://localhost:3000';

const baseUrl = new URL(process.env.HOST_MONITOR_API_URL ?? DEFAULT_API_URL);
let sessionToken = process.env.HOST_MONITOR_TOKEN;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: JsonValue;
  token?: string;
  query?: Record<string, string | number | undefined>;
};

const optionalTokenSchema = z
  .string()
  .trim()
  .min(1)
  .optional()
  .describe(
    'JWT opcional. Se omitido, usa HOST_MONITOR_TOKEN ou token salvo por login.'
  );

const hostPayloadSchema = {
  name: z.string().trim().min(1).describe('Nome amigavel do host.'),
  address: z
    .string()
    .trim()
    .min(1)
    .describe('Endereco IPv4, IPv6 ou dominio do host.'),
  category: z.string().trim().min(1).describe('Categoria do host.'),
};

const asToolResult = (data: unknown): CallToolResult => ({
  content: [
    {
      type: 'text',
      text:
        typeof data === 'string' ? data : JSON.stringify(data, undefined, 2),
    },
  ],
});

const buildUrl = (
  path: string,
  query: Record<string, string | number | undefined> = {}
): URL => {
  const url = new URL(path, baseUrl);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
};

const readJson = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return { ok: true };
  }

  const text = await response.text();

  if (text.length === 0) {
    return { ok: response.ok };
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const apiRequest = async (
  path: string,
  { method = 'GET', body, token, query }: RequestOptions = {}
): Promise<unknown> => {
  const headers = new Headers({ Accept: 'application/json' });
  const authToken = token ?? sessionToken;

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (authToken !== undefined) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await readJson(response);

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof data.error === 'string'
        ? data.error
        : `Host Monitor API returned ${response.status}`;

    throw new Error(message);
  }

  return data;
};

const rememberToken = (data: unknown): void => {
  if (
    typeof data === 'object' &&
    data !== null &&
    'token' in data &&
    typeof data.token === 'string'
  ) {
    sessionToken = data.token;
  }
};

const server = new McpServer({
  name: 'host-monitor-mcp',
  version: '1.0.0',
});

server.registerTool(
  'host_monitor_config',
  {
    title: 'Host Monitor MCP Config',
    description: 'Mostra a configuracao atual de conexao com a API Express.',
  },
  async () =>
    asToolResult({
      apiUrl: baseUrl.toString(),
      hasToken: sessionToken !== undefined,
    })
);

server.registerTool(
  'host_monitor_openapi',
  {
    title: 'Host Monitor OpenAPI',
    description: 'Busca a especificacao OpenAPI publicada pela API Express.',
  },
  async () => asToolResult(await apiRequest('/api/docs.json'))
);

server.registerTool(
  'host_monitor_register',
  {
    title: 'Register Host Monitor User',
    description:
      'Cadastra um usuario na API Express e salva o JWT retornado para chamadas seguintes.',
    inputSchema: {
      name: z.string().trim().min(1),
      email: z.string().trim().email(),
      password: z.string().min(6),
      passwordConfirmation: z.string().min(6),
    },
  },
  async (input) => {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: input,
    });
    rememberToken(data);

    return asToolResult(data);
  }
);

server.registerTool(
  'host_monitor_login',
  {
    title: 'Login Host Monitor User',
    description:
      'Autentica na API Express e salva o JWT retornado para chamadas seguintes.',
    inputSchema: {
      email: z.string().trim().email(),
      password: z.string().min(1),
    },
  },
  async (input) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: input,
    });
    rememberToken(data);

    return asToolResult(data);
  }
);

server.registerTool(
  'host_monitor_set_token',
  {
    title: 'Set Host Monitor JWT',
    description:
      'Define manualmente o JWT usado pelo processo MCP nas proximas chamadas.',
    inputSchema: {
      token: z.string().trim().min(1),
    },
  },
  async ({ token }) => {
    sessionToken = token;

    return asToolResult({ ok: true, hasToken: true });
  }
);

server.registerTool(
  'host_monitor_list_hosts',
  {
    title: 'List Hosts',
    description: 'Lista os hosts cadastrados na API Express.',
    inputSchema: {
      token: optionalTokenSchema,
    },
  },
  async ({ token }) => asToolResult(await apiRequest('/api/hosts', { token }))
);

server.registerTool(
  'host_monitor_get_host',
  {
    title: 'Get Host',
    description: 'Busca um host pelo id.',
    inputSchema: {
      id: z.string().trim().min(1),
      token: optionalTokenSchema,
    },
  },
  async ({ id, token }) =>
    asToolResult(
      await apiRequest(`/api/hosts/${encodeURIComponent(id)}`, { token })
    )
);

server.registerTool(
  'host_monitor_create_host',
  {
    title: 'Create Host',
    description: 'Cria um host e executa o ping inicial via API Express.',
    inputSchema: {
      ...hostPayloadSchema,
      token: optionalTokenSchema,
    },
  },
  async ({ token, ...host }) =>
    asToolResult(
      await apiRequest('/api/hosts', {
        method: 'POST',
        body: host,
        token,
      })
    )
);

server.registerTool(
  'host_monitor_update_host',
  {
    title: 'Update Host',
    description: 'Atualiza os dados de um host existente.',
    inputSchema: {
      id: z.string().trim().min(1),
      ...hostPayloadSchema,
      token: optionalTokenSchema,
    },
  },
  async ({ id, token, ...host }) =>
    asToolResult(
      await apiRequest(`/api/hosts/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: host,
        token,
      })
    )
);

server.registerTool(
  'host_monitor_delete_host',
  {
    title: 'Delete Host',
    description: 'Remove um host pelo id.',
    inputSchema: {
      id: z.string().trim().min(1),
      token: optionalTokenSchema,
    },
  },
  async ({ id, token }) =>
    asToolResult(
      await apiRequest(`/api/hosts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        token,
      })
    )
);

server.registerTool(
  'host_monitor_ping_host',
  {
    title: 'Ping Host',
    description:
      'Executa ping em um host cadastrado, registra o resultado e retorna estatisticas.',
    inputSchema: {
      id: z.string().trim().min(1),
      count: z.number().int().positive().optional(),
      token: optionalTokenSchema,
    },
  },
  async ({ id, count, token }) =>
    asToolResult(
      await apiRequest(`/api/hosts/${encodeURIComponent(id)}/ping`, {
        token,
        query: { count },
      })
    )
);

server.registerTool(
  'host_monitor_get_host_details',
  {
    title: 'Get Host Details',
    description: 'Retorna host, historico de ping e estatisticas.',
    inputSchema: {
      id: z.string().trim().min(1),
      limit: z.number().int().positive().optional(),
      token: optionalTokenSchema,
    },
  },
  async ({ id, limit, token }) =>
    asToolResult(
      await apiRequest(`/api/hosts/${encodeURIComponent(id)}/details`, {
        token,
        query: { limit },
      })
    )
);

server.registerTool(
  'host_monitor_get_host_history',
  {
    title: 'Get Host History',
    description: 'Retorna o historico de ping de um host.',
    inputSchema: {
      id: z.string().trim().min(1),
      limit: z.number().int().positive().optional(),
      token: optionalTokenSchema,
    },
  },
  async ({ id, limit, token }) =>
    asToolResult(
      await apiRequest(`/api/hosts/${encodeURIComponent(id)}/history`, {
        token,
        query: { limit },
      })
    )
);

await server.connect(new StdioServerTransport());
