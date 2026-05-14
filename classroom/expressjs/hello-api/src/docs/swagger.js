const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Hello API',
    version: '1.0.0',
    description:
      'API de exemplo com Express para demonstrar rotas, parametros e tratamento de erros.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  tags: [{ name: 'Root' }, { name: 'Hello' }],
  paths: {
    '/api/': {
      get: {
        tags: ['Root'],
        summary: 'Mensagem base da API',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                example: { message: 'Hello API' },
              },
            },
          },
        },
      },
    },
    '/api/en': {
      get: {
        tags: ['Root'],
        summary: 'Mensagem hello em ingles',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                example: { message: 'Hello, World!' },
              },
            },
          },
        },
      },
    },
    '/api/pt': {
      get: {
        tags: ['Root'],
        summary: 'Mensagem hello em portugues',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                example: { message: 'Ola, Mundo!' },
              },
            },
          },
        },
      },
    },
    '/api/hello/en/{name}': {
      get: {
        tags: ['Hello'],
        summary: 'Cumprimenta em ingles via path parameter',
        parameters: [
          {
            in: 'path',
            name: 'name',
            required: true,
            schema: { type: 'string' },
            description: 'Nome da pessoa',
          },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                example: { message: 'Hello, John!' },
              },
            },
          },
        },
      },
    },
    '/api/hello/pt': {
      get: {
        tags: ['Hello'],
        summary: 'Cumprimenta em portugues via query parameter',
        parameters: [
          {
            in: 'query',
            name: 'name',
            required: true,
            schema: { type: 'string' },
            description: 'Nome da pessoa',
          },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                example: { message: 'Ola, John!' },
              },
            },
          },
          400: {
            description: 'Parametro name ausente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Name query parameter is required' },
              },
            },
          },
        },
      },
    },
    '/api/hello/es': {
      post: {
        tags: ['Hello'],
        summary: 'Cumprimenta em espanhol via body JSON',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                },
              },
              example: { name: 'John' },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                example: { message: '¡Hola, John!' },
              },
            },
          },
          400: {
            description: 'Content-Type invalido ou name ausente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  invalidContentType: {
                    summary: 'Header incorreto',
                    value: { error: 'Content-Type must be application/json' },
                  },
                  missingName: {
                    summary: 'Campo name ausente',
                    value: { error: 'Name body parameter is required' },
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
    },
  },
};

export default swaggerSpec;
