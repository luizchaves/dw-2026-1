const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Host Monitor API',
    version: '1.0.0',
    description:
      'API de monitoramento de hosts com Express para demonstrar operações de CRUD e ping.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  tags: [{ name: 'Hosts' }, { name: 'Ping' }],
  paths: {
    '/api/hosts': {
      get: {
        tags: ['Hosts'],
        summary: 'Lista todos os hosts',
        responses: {
          200: {
            description: 'Lista de hosts retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/HostResponse' },
                },
                example: [
                  {
                    id: 'cuid123',
                    name: 'Server A',
                    ip: '192.168.0.10',
                    os: 'Linux',
                    group: 'Production',
                    status: 'Online',
                    uptime: '24 days',
                  },
                ],
              },
            },
          },
        },
      },
      post: {
        tags: ['Hosts'],
        summary: 'Cria um novo host',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HostRequest' },
              example: {
                name: 'Server A',
                ip: '192.168.0.10',
                os: 'Linux',
                group: 'Production',
                status: 'Online',
                uptime: '24 days',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Host criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HostResponse' },
                example: {
                  id: 'cuid123',
                  name: 'Server A',
                  ip: '192.168.0.10',
                  os: 'Linux',
                  group: 'Production',
                  status: 'Online',
                  uptime: '24 days',
                },
              },
            },
          },
          400: {
            description: 'Erro de validação ou Content-Type inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  invalidContentType: {
                    summary: 'Content-Type incorreto',
                    value: {
                      error: 'Content-Type must be application/json',
                    },
                  },
                  invalidBody: {
                    summary: 'Body inválido',
                    value: {
                      error: 'Invalid body',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/hosts/{id}': {
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID do host',
        },
      ],
      put: {
        tags: ['Hosts'],
        summary: 'Atualiza um host existente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HostRequest' },
              example: {
                name: 'Server B',
                ip: '192.168.0.11',
                os: 'Windows',
                group: 'Staging',
                status: 'Online',
                uptime: '10 days',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Host atualizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HostResponse' },
                example: {
                  id: 'cuid123',
                  name: 'Server B',
                  ip: '192.168.0.11',
                  os: 'Windows',
                  group: 'Staging',
                  status: 'Online',
                  uptime: '10 days',
                },
              },
            },
          },
          400: {
            description: 'Host não encontrado ou dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: {
                    summary: 'Host não encontrado',
                    value: { error: 'Host not found' },
                  },
                  invalidParams: {
                    summary: 'Parâmetros inválidos',
                    value: { error: 'Invalid path parameters' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Hosts'],
        summary: 'Remove um host pelo ID',
        responses: {
          204: {
            description: 'Host removido com sucesso',
          },
          400: {
            description: 'Host não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Host not found' },
              },
            },
          },
        },
      },
    },
    '/api/hosts/{id}/ping': {
      get: {
        tags: ['Ping'],
        summary: 'Executa ping em um host existente',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID do host',
          },
          {
            in: 'query',
            name: 'count',
            required: false,
            schema: { type: 'integer', default: 1 },
            description: 'Quantidade de pacotes de ping',
          },
        ],
        responses: {
          200: {
            description: 'Resultado do ping',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PingResponse' },
                example: {
                  host: '127.0.0.1',
                  ip: '127.0.0.1',
                  packets: [{ seq: 0, ttl: 64, time: 0.123 }],
                  statistics: {
                    transmitted: 1,
                    received: 1,
                    losted: 0,
                    min: 0.123,
                    avg: 0.123,
                    max: 0.123,
                    stddev: 0.0,
                  },
                  output: 'PING 127.0.0.1 (127.0.0.1): 56 data bytes...',
                },
              },
            },
          },
          400: {
            description: 'Host não encontrado ou count inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  missingHost: {
                    summary: 'Host ausente',
                    value: { error: 'Host not found' },
                  },
                  invalidCount: {
                    summary: 'Count inválido',
                    value: { error: 'Count must be a positive number' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      MessageResponse: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string' },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string' },
        },
      },
      HostRequest: {
        type: 'object',
        required: ['name', 'ip', 'os', 'group', 'status', 'uptime'],
        properties: {
          name: { type: 'string' },
          ip: { type: 'string', format: 'ipv4' },
          os: { type: 'string' },
          group: { type: 'string' },
          status: {
            type: 'string',
            enum: ['Online', 'Manutenção', 'Offline'],
          },
          uptime: { type: 'string' },
        },
      },
      HostResponse: {
        allOf: [
          { $ref: '#/components/schemas/HostRequest' },
          {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string' },
            },
          },
        ],
      },
      PingPacket: {
        type: 'object',
        properties: {
          seq: { type: 'integer' },
          ttl: { type: 'integer' },
          time: { type: 'number' },
        },
      },
      PingStatistics: {
        type: 'object',
        properties: {
          transmitted: { type: 'integer' },
          received: { type: 'integer' },
          losted: { type: 'integer' },
          min: { type: 'number' },
          avg: { type: 'number' },
          max: { type: 'number' },
          stddev: { type: 'number' },
        },
      },
      PingResponse: {
        type: 'object',
        properties: {
          host: { type: 'string' },
          ip: { type: 'string' },
          packets: {
            type: 'array',
            items: { $ref: '#/components/schemas/PingPacket' },
          },
          statistics: { $ref: '#/components/schemas/PingStatistics' },
          output: { type: 'string' },
        },
      },
    },
  },
};

export default swaggerSpec;
