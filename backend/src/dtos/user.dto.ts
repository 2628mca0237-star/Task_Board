import { z } from 'zod';

export const CreateUserDto = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const LoginUserDto = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const UpdateUserDto = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type LoginUserDtoType = z.infer<typeof LoginUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
