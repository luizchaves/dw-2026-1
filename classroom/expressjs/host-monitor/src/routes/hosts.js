import express from 'express';
import { z } from 'zod';
import { HttpError } from '../errors/HttpError.js';
import { ping } from '../lib/ping.js';
import { requireJsonContentType } from '../middleware/requireJsonContentType.js';
import { validateRequest } from '../middleware/validation.js';
import Host from '../models/Hosts.js';
import { hostCreateSchema, hostUpdateSchema } from '../schemas/host.js';
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
      const newHost = await Host.create(req.body);

      try {
        const result = await ping(newHost.address, 1);
        await Host.addPingResult(newHost.id, result);
      } catch (error) {
        await Host.addPingError(newHost.id, error.message);
      }

      res.status(201).json(await Host.readById(newHost.id));
    } catch (error) {
      mapHostError(error);
    }
  }
);

routes.get('/hosts', async (req, res) => {
  res.json(await Host.read());
});

routes.get(
  '/hosts/:id',
  validateRequest({ params: z.object({ id: z.string() }) }),
  async (req, res) => {
    const { id } = req.params;

    try {
      res.json(await Host.readById(id));
    } catch (error) {
      mapHostError(error);
    }
  }
);

routes.get(
  '/hosts/:id/details',
  validateRequest({ params: z.object({ id: z.string() }) }),
  async (req, res) => {
    const { id } = req.params;
    const { limit } = req.query;

    try {
      const details = await Host.readDetails(id, limit);

      res.json(details);
    } catch (error) {
      mapHostError(error);
    }
  }
);

routes.get(
  '/hosts/:id/history',
  validateRequest({ params: z.object({ id: z.string() }) }),
  async (req, res) => {
    const { id } = req.params;
    const { limit } = req.query;

    try {
      await Host.readById(id);
      const history = await Host.readPingHistory(id, limit);

      res.json(history);
    } catch (error) {
      mapHostError(error);
    }
  }
);

routes.put(
  '/hosts/:id',
  requireJsonContentType,
  validateRequest({
    body: hostUpdateSchema,
    params: z.object({ id: z.string() }),
  }),
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

      const pingState = await Host.addPingResult(id, result);

      res.json({
        ...result,
        reachable: true,
        checkedAt: pingState.checkedAt,
        hostStatus: {
          status: 'Online',
          uptime: pingState.statistics.availability,
          lastCheckedAt: pingState.statistics.lastCheckAt,
        },
      });
    } catch (error) {
      const pingState = await Host.addPingError(id, error.message);

      res.status(200).json({
        host: host.address,
        ip: null,
        packets: [],
        statistics: {
          transmitted: 0,
          received: 0,
          losted: 0,
          min: null,
          avg: null,
          max: null,
          stddev: null,
        },
        output: '',
        reachable: false,
        error: error.message,
        checkedAt: pingState.checkedAt,
        hostStatus: {
          status: 'Offline',
          uptime: pingState.statistics.availability,
          lastCheckedAt: pingState.statistics.lastCheckAt,
        },
      });
    }
  }
);

export default routes;
