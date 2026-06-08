import express from 'express';
import { z } from 'zod';

import {
  createHost,
  listHosts,
  pingHost,
  readHost,
  readHostDetails,
  readHostHistory,
  removeHost,
  updateHost,
} from '@/controllers/hosts.controller.js';
import { requireJsonContentType } from '@/middleware/requireJsonContentType.js';
import { validateRequest } from '@/middleware/validation.js';
import { hostCreateSchema, hostUpdateSchema } from '@/schemas/host.js';

const routes = express.Router();
const idParamsSchema = z.object({ id: z.string() });

routes.post(
  '/hosts',
  requireJsonContentType,
  validateRequest({ body: hostCreateSchema }),
  createHost
);

routes.get('/hosts', listHosts);

routes.get('/hosts/:id', validateRequest({ params: idParamsSchema }), readHost);

routes.get(
  '/hosts/:id/details',
  validateRequest({ params: idParamsSchema }),
  readHostDetails
);

routes.get(
  '/hosts/:id/history',
  validateRequest({ params: idParamsSchema }),
  readHostHistory
);

routes.put(
  '/hosts/:id',
  requireJsonContentType,
  validateRequest({
    body: hostUpdateSchema,
    params: idParamsSchema,
  }),
  updateHost
);

routes.delete(
  '/hosts/:id',
  validateRequest({ params: idParamsSchema }),
  removeHost
);

routes.get(
  '/hosts/:id/ping',
  validateRequest({ params: idParamsSchema }),
  pingHost
);

export default routes;
