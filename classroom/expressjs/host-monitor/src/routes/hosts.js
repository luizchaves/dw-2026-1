import express from 'express';
import { z } from 'zod';
import cuid from 'cuid';
import { HttpError } from '../errors/HttpError.js';
import { ping } from '../lib/ping.js';
import { requireJsonContentType } from '../middleware/requireJsonContentType.js';
import { validateRequest } from '../middleware/validation.js';
import Host from '../models/Hosts.js';
import { HostNotFoundError, InvalidHostError } from '../errors/HostError.js';
const routes = express.Router();

const hostSchema = z.object({
  name: z.string(),
  ip: z.ipv4(),
  os: z.string(),
  group: z.string(),
  status: z.enum(['Online', 'Manutenção', 'Offline']),
  uptime: z.string(),
});

const mapHostError = (error) => {
  if (error instanceof HostNotFoundError || error instanceof InvalidHostError) {
    throw new HttpError(error.message);
  }

  throw error;
};

routes.post(
  '/hosts',
  requireJsonContentType,
  validateRequest({ body: hostSchema }),
  async (req, res) => {
    try {
      const newHost = Host.create({ ...req.body, id: cuid() });

      res.status(201).json(newHost);
    } catch (error) {
      mapHostError(error);
    }
  }
);

routes.get('/hosts', async (req, res) => {
  res.json(Host.read());
});

routes.put(
  '/hosts/:id',
  requireJsonContentType,
  validateRequest({ body: hostSchema, params: z.object({ id: z.cuid() }) }),
  async (req, res) => {
    const { id } = req.params;

    try {
      const updatedHost = Host.update({ id, ...req.body });

      res.status(200).json(updatedHost);
    } catch (error) {
      mapHostError(error);
    }
  }
);

routes.delete(
  '/hosts/:id',
  validateRequest({ params: z.object({ id: z.cuid() }) }),
  async (req, res) => {
    const { id } = req.params;

    try {
      Host.remove(id);
      res.status(204).send();
    } catch (error) {
      mapHostError(error);
    }
  }
);

routes.get(
  '/hosts/:id/ping',
  validateRequest({ params: z.object({ id: z.cuid() }) }),
  async (req, res) => {
    const { id } = req.params;
    const { count } = req.query;

    let host;
    try {
      host = Host.readById(id);
    } catch (error) {
      mapHostError(error);
    }

    const parsedCount = count !== undefined ? Number(count) : 1;

    if (Number.isNaN(parsedCount) || parsedCount < 1) {
      throw new HttpError('Count must be a positive number');
    }

    try {
      const result = await ping(host.ip, parsedCount);

      res.json(result);
    } catch (error) {
      throw new HttpError(error.message);
    }
  }
);

export default routes;
