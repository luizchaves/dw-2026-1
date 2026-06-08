import type { RequestHandler } from 'express';

import { HostNotFoundError, InvalidHostError } from '@/errors/HostError.js';
import { HttpError } from '@/errors/HttpError.js';
import { ping } from '@/lib/ping.js';
import Host from '@/models/Hosts.js';
import type { HostRecord } from '@/types.js';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown host';

const getRequiredParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
};

const mapHostError = (error: unknown): never => {
  if (error instanceof HostNotFoundError || error instanceof InvalidHostError) {
    throw new HttpError(error.message);
  }

  throw error;
};

export const createHost: RequestHandler = async (req, res) => {
  try {
    const newHost = await Host.create(req.body);

    try {
      const result = await ping(newHost.address, 1);
      await Host.addPingResult(newHost.id, result);
    } catch (error) {
      await Host.addPingError(newHost.id, getErrorMessage(error));
    }

    res.status(201).json(await Host.readById(newHost.id));
  } catch (error) {
    mapHostError(error);
  }
};

export const listHosts: RequestHandler = async (_req, res) => {
  res.json(await Host.read());
};

export const readHost: RequestHandler = async (req, res) => {
  const id = getRequiredParam(req.params.id);

  try {
    res.json(await Host.readById(id));
  } catch (error) {
    mapHostError(error);
  }
};

export const readHostDetails: RequestHandler = async (req, res) => {
  const id = getRequiredParam(req.params.id);
  const { limit } = req.query;

  try {
    const details = await Host.readDetails(id, limit);

    res.json(details);
  } catch (error) {
    mapHostError(error);
  }
};

export const readHostHistory: RequestHandler = async (req, res) => {
  const id = getRequiredParam(req.params.id);
  const { limit } = req.query;

  try {
    await Host.readById(id);
    const history = await Host.readPingHistory(id, limit);

    res.json(history);
  } catch (error) {
    mapHostError(error);
  }
};

export const updateHost: RequestHandler = async (req, res) => {
  const id = getRequiredParam(req.params.id);

  try {
    const updatedHost = await Host.update({ id, ...req.body });

    res.status(200).json(updatedHost);
  } catch (error) {
    mapHostError(error);
  }
};

export const removeHost: RequestHandler = async (req, res) => {
  const id = getRequiredParam(req.params.id);

  try {
    await Host.remove(id);
    res.status(204).send();
  } catch (error) {
    mapHostError(error);
  }
};

export const pingHost: RequestHandler = async (req, res) => {
  const id = getRequiredParam(req.params.id);
  const { count } = req.query;

  const host: HostRecord = await Host.readById(id).catch(mapHostError);

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
    const message = getErrorMessage(error);
    const pingState = await Host.addPingError(id, message);

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
      error: message,
      checkedAt: pingState.checkedAt,
      hostStatus: {
        status: 'Offline',
        uptime: pingState.statistics.availability,
        lastCheckedAt: pingState.statistics.lastCheckAt,
      },
    });
  }
};
