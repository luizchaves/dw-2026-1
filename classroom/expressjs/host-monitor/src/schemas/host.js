import { z } from 'zod';

const domainRegex =
  /^(?=.{1,253}$)(?!-)(?:[A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,63}$/;

const addressSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      z.ipv4().safeParse(value).success ||
      z.ipv6().safeParse(value).success ||
      domainRegex.test(value),
    'Invalid address'
  );

const hostCreateSchema = z.object({
  name: z.string(),
  address: addressSchema,
  category: z.string(),
});

const hostUpdateSchema = z.object({
  name: z.string(),
  address: addressSchema,
  category: z.string(),
});

const hostSchema = hostUpdateSchema.extend({
  status: z.enum(['Unknown', 'Online', 'Offline']),
  uptime: z.number().min(0).max(100),
  lastCheckedAt: z.string().datetime().nullable(),
});

const hostWithIdSchema = hostUpdateSchema.extend({
  id: z.string(),
});

export { hostCreateSchema, hostUpdateSchema, hostSchema, hostWithIdSchema };
