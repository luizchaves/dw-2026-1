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

const hostSchema = z.object({
  name: z.string(),
  address: addressSchema,
  category: z.string(),
  status: z.enum(['Online', 'Manutenção', 'Offline']),
  uptime: z.string(),
});

const hostWithIdSchema = hostSchema.extend({
  id: z.string(),
});

export { hostCreateSchema, hostSchema, hostWithIdSchema };
