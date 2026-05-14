const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Hello API',
    version: '1.0.0',
    description:
      'Sample Express API to demonstrate routes, parameters, and error handling.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
  tags: [{ name: 'Root' }, { name: 'Hello' }],
  paths: {
    '/api/': {
      get: {
        tags: ['Root'],
        summary: 'Base API message',
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
        summary: 'Hello message in English',
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
        summary: 'Hello message in Portuguese',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                example: { message: 'Olá, Mundo!' },
              },
            },
          },
        },
      },
    },
    '/api/hello/en/{name}': {
      get: {
        tags: ['Hello'],
        summary: 'Greets in English using path parameter',
        parameters: [
          {
            in: 'path',
            name: 'name',
            required: true,
            schema: { type: 'string' },
            description: 'Person name',
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
        summary: 'Greets in Portuguese using query parameter',
        parameters: [
          {
            in: 'query',
            name: 'name',
            required: true,
            schema: { type: 'string' },
            description: 'Person name',
          },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                example: { message: 'Olá, John!' },
              },
            },
          },
          400: {
            description: 'Missing name parameter',
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
        summary: 'Greets in Spanish using JSON body',
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
            description: 'Invalid Content-Type or missing name',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  invalidContentType: {
                    summary: 'Invalid header',
                    value: { error: 'Content-Type must be application/json' },
                  },
                  missingName: {
                    summary: 'Missing name field',
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
