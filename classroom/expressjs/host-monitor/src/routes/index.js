import express from 'express';
import { z } from 'zod';
import cuid from 'cuid';
import { HttpError } from '../errors/HttpError.js';
import { ping } from '../lib/ping.js';
import { requireJsonContentType } from '../middleware/requireJsonContentType.js';
import { validateRequest } from '../middleware/validation.js';
import { hosts } from '../database/data.js';
const routes = express.Router();

const hostSchema = z.object({
  name: z.string(),
  ip: z.ipv4(),
  os: z.string(),
  group: z.string(),
  status: z.enum(['Online', 'Manutenção', 'Offline']),
  uptime: z.string(),
});

routes.post(
  '/hosts',
  requireJsonContentType,
  validateRequest({ body: hostSchema }),
  async (req, res) => {
    const newHost = { ...req.body, id: cuid() };

    hosts.push(newHost);

    res.status(201).json(newHost);
  }
);

routes.get('/hosts', async (req, res) => {
  res.json(hosts);
});

routes.put(
  '/hosts/:id',
  requireJsonContentType,
  validateRequest({ body: hostSchema, params: z.object({ id: z.cuid() }) }),
  async (req, res) => {
    const { id } = req.params;

    const hostIndex = hosts.findIndex((h) => h.id === id);

    if (hostIndex === -1) {
      throw new HttpError('Host not found');
    }

    const updatedHost = { ...req.body, id };

    hosts[hostIndex] = updatedHost;

    res.status(200).json(updatedHost);
  }
);

routes.delete(
  '/hosts/:id',
  validateRequest({ params: z.object({ id: z.cuid() }) }),
  async (req, res) => {
    const { id } = req.params;

    const hostIndex = hosts.findIndex((h) => h.id === id);

    if (hostIndex === -1) {
      throw new HttpError('Host not found');
    }

    hosts.splice(hostIndex, 1);

    res.status(204).send();
  }
);

routes.get(
  '/hosts/:id/ping',
  validateRequest({ params: z.object({ id: z.cuid() }) }),
  async (req, res) => {
    const { id } = req.params;
    const { count } = req.query;

    const host = hosts.find((h) => h.id === id);

    if (!host) {
      throw new HttpError('Host not found');
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
