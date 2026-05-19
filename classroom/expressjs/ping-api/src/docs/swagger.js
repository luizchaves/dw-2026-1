const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Ping API',
    version: '1.0.0',
    description:
      'API de ping para verificar a conectividade de um host a partir do servidor.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  tags: [{ name: 'Ping' }],
  paths: {
    '/api/ping': {
      get: {
        tags: ['Ping'],
        summary: 'Executa ping em um host',
        parameters: [
          {
            in: 'query',
            name: 'host',
            required: true,
            schema: { type: 'string' },
            description: 'Host ou domínio a ser pingado',
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
            description: 'Parâmetro host ausente ou host inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  missingHost: {
                    summary: 'Host ausente',
                    value: { error: 'Host is required' },
                  },
                  unknownHost: {
                    summary: 'Host desconhecido',
                    value: { error: 'Unknown host' },
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
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string' },
        },
      },
      PingPacket: {
        type: 'object',
        required: ['seq', 'ttl', 'time'],
        properties: {
          seq: { type: 'integer' },
          ttl: { type: 'integer' },
          time: { type: 'number' },
        },
      },
      PingStatistics: {
        type: 'object',
        required: [
          'transmitted',
          'received',
          'lossed',
          'min',
          'avg',
          'max',
          'stddev',
        ],
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
        required: ['host', 'ip', 'packets', 'statistics', 'output'],
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
