import express from 'express';
import { HttpError } from '../errors/HttpError.js';
import { ping } from '../lib/ping.js';
const routes = express.Router();

routes.get('/ping', async (req, res) => {
  const { host, count } = req.query;

  if (!host) {
    throw new HttpError('Host is required');
  }

  try {
    const result = await ping(host, count);

    res.json(result);
  } catch (error) {
    throw new HttpError(error.message);
  }
});

export default routes;
