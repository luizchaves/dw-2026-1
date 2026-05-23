import express from 'express';
import { z } from 'zod';
import { HttpError } from '../errors/HttpError.js';
import { ping } from '../lib/ping.js';
import { requireJsonContentType } from '../middleware/requireJsonContentType.js';
import { validateRequest } from '../middleware/validation.js';
import Host from '../models/Hosts.js';
import { hostCreateSchema, hostSchema } from '../schemas/host.js';
import { HostNotFoundError, InvalidHostError } from '../errors/HostError.js';
const routes = express.Router();

const mapHostError = (error) => {
  if (error instanceof HostNotFoundError || error instanceof InvalidHostError) {
    throw new HttpError(error.message);
  }

  throw error;
};

routes.post(
  '/hosts',
  requireJsonContentType,
  validateRequest({ body: hostCreateSchema }),
  async (req, res) => {
    try {
      const newHost = await Host.create({ ...req.body, status: 'Online' });

      res.status(201).json(newHost);
    } catch (error) {
      mapHostError(error);
    }
  }
);

routes.get('/hosts', async (req, res) => {
  res.json(await Host.read());
});

routes.put(
  '/hosts/:id',
  requireJsonContentType,
  validateRequest({ body: hostSchema, params: z.object({ id: z.string() }) }),
  async (req, res) => {
    const { id } = req.params;

    try {
      const updatedHost = await Host.update({ id, ...req.body });

      res.status(200).json(updatedHost);
    } catch (error) {
      mapHostError(error);
    }
  }
);

routes.delete(
  '/hosts/:id',
  validateRequest({ params: z.object({ id: z.string() }) }),
  async (req, res) => {
    const { id } = req.params;

    try {
      await Host.remove(id);
      res.status(204).send();
    } catch (error) {
      mapHostError(error);
    }
  }
);

routes.get(
  '/hosts/:id/ping',
  validateRequest({ params: z.object({ id: z.string() }) }),
  async (req, res) => {
    const { id } = req.params;
    const { count } = req.query;

    let host;
    try {
      host = await Host.readById(id);
    } catch (error) {
      mapHostError(error);
    }

    const parsedCount = count !== undefined ? Number(count) : 1;

    if (Number.isNaN(parsedCount) || parsedCount < 1) {
      throw new HttpError('Count must be a positive number');
    }

    try {
      const result = await ping(host.address, parsedCount);

      res.json(result);
    } catch (error) {
      throw new HttpError(error.message);
    }
  }
);

export default routes;
