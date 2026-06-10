import type { RequestHandler } from 'express';

import User from '@/models/Users.js';

export const registerUser: RequestHandler = async (req, res) => {
  const response = await User.register(req.body);

  res.status(201).json(response);
};

export const loginUser: RequestHandler = async (req, res) => {
  res.json(await User.login(req.body));
};
