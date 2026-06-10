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
  tags: [
    { name: 'Auth' },
    { name: 'Hosts' },
    { name: 'Ping' },
    { name: 'History' },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Cadastra um novo usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
              example: {
                name: 'Maria Silva',
                email: 'maria@example.com',
                password: 'secret123',
                passwordConfirmation: 'secret123',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario cadastrado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Dados invalidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          409: {
            description: 'E-mail ja cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Email already registered' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autentica usuario e retorna JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: {
                email: 'maria@example.com',
                password: 'secret123',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Credenciais invalidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Invalid email or password' },
              },
            },
          },
        },
      },
    },
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
                    address: '192.168.0.10',
                    category: 'Production',
                    status: 'Unknown',
                    uptime: 0,
                    lastCheckedAt: null,
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
                address: '192.168.0.10',
                category: 'Production',
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
                  address: '192.168.0.10',
                  category: 'Production',
                  status: 'Unknown',
                  uptime: 0,
                  lastCheckedAt: null,
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
      get: {
        tags: ['Hosts'],
        summary: 'Busca detalhes de um host pelo ID',
        responses: {
          200: {
            description: 'Host encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HostResponse' },
              },
            },
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
                address: '192.168.0.11',
                category: 'Staging',
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
                  address: '192.168.0.11',
                  category: 'Staging',
                  status: 'Unknown',
                  uptime: 0,
                  lastCheckedAt: null,
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
    '/api/hosts/{id}/details': {
      get: {
        tags: ['History'],
        summary: 'Retorna detalhes do host com histórico e estatísticas',
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
            name: 'limit',
            required: false,
            schema: { type: 'integer', default: 20 },
            description: 'Quantidade de itens do histórico',
          },
        ],
        responses: {
          200: {
            description: 'Detalhes do host retornados com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HostDetailsResponse' },
              },
            },
          },
          400: {
            description: 'Host não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
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
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'passwordConfirmation'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          passwordConfirmation: { type: 'string', minLength: 6 },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      UserResponse: {
        type: 'object',
        required: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        required: ['user', 'token'],
        properties: {
          user: { $ref: '#/components/schemas/UserResponse' },
          token: { type: 'string', description: 'JWT de acesso' },
        },
      },
      HostRequest: {
        type: 'object',
        required: ['name', 'address', 'category'],
        properties: {
          name: { type: 'string' },
          address: {
            type: 'string',
            description: 'IPv4 ou dominio (ex.: 8.8.8.8 ou google.com)',
          },
          category: { type: 'string' },
        },
      },
      HostStatus: {
        type: 'object',
        required: ['status', 'uptime', 'lastCheckedAt'],
        properties: {
          status: {
            type: 'string',
            enum: ['Unknown', 'Online', 'Offline'],
          },
          uptime: { type: 'number' },
          lastCheckedAt: {
            type: 'string',
            nullable: true,
          },
        },
      },
      HostResponse: {
        type: 'object',
        required: ['id', 'name', 'address', 'category', 'status', 'uptime'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          address: { type: 'string' },
          category: { type: 'string' },
          status: { type: 'string' },
          uptime: { type: 'number' },
          lastCheckedAt: {
            type: 'string',
            nullable: true,
          },
        },
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
          ip: { type: 'string', nullable: true },
          packets: {
            type: 'array',
            items: { $ref: '#/components/schemas/PingPacket' },
          },
          statistics: { $ref: '#/components/schemas/PingStatistics' },
          output: { type: 'string' },
          reachable: { type: 'boolean' },
          error: {
            type: 'string',
            nullable: true,
          },
          checkedAt: { type: 'string' },
          hostStatus: { $ref: '#/components/schemas/HostStatus' },
        },
      },
      PingHistoryItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          checkedAt: { type: 'string' },
          reachable: { type: 'boolean' },
          transmitted: { type: 'integer' },
          received: { type: 'integer' },
          minMs: { type: 'number', nullable: true },
          avgMs: { type: 'number', nullable: true },
          maxMs: { type: 'number', nullable: true },
          stddevMs: { type: 'number', nullable: true },
          error: { type: 'string', nullable: true },
        },
      },
      HostAvailabilityStatistics: {
        type: 'object',
        properties: {
          totalChecks: { type: 'integer' },
          successfulChecks: { type: 'integer' },
          failedChecks: { type: 'integer' },
          availability: { type: 'number' },
          averageLatency: { type: 'number', nullable: true },
          minLatency: { type: 'number', nullable: true },
          maxLatency: { type: 'number', nullable: true },
          lastCheckAt: { type: 'string', nullable: true },
        },
      },
      HostDetailsResponse: {
        type: 'object',
        properties: {
          host: { $ref: '#/components/schemas/HostResponse' },
          statistics: {
            $ref: '#/components/schemas/HostAvailabilityStatistics',
          },
          history: {
            type: 'array',
            items: { $ref: '#/components/schemas/PingHistoryItem' },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
