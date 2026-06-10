import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(6, 'Password must have at least 6 characters');

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Invalid email'));

const userRegisterSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Password confirmation does not match',
    path: ['passwordConfirmation'],
  });

const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

type UserRegisterInput = z.infer<typeof userRegisterSchema>;
type UserLoginInput = z.infer<typeof userLoginSchema>;

export { userLoginSchema, userRegisterSchema };
export type { UserLoginInput, UserRegisterInput };
