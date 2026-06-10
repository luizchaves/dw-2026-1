import express from 'express';

import { loginUser, registerUser } from '@/controllers/auth.controller.js';
import { requireJsonContentType } from '@/middleware/requireJsonContentType.js';
import { validateRequest } from '@/middleware/validation.js';
import { userLoginSchema, userRegisterSchema } from '@/schemas/auth.js';

const routes = express.Router();

routes.post(
  '/auth/register',
  requireJsonContentType,
  validateRequest({ body: userRegisterSchema }),
  registerUser
);

routes.post(
  '/auth/login',
  requireJsonContentType,
  validateRequest({ body: userLoginSchema }),
  loginUser
);

export default routes;
