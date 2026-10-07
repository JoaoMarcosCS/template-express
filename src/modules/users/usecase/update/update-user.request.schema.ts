import z from 'zod';

export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email('E-mail inválido').optional(),
  document: z.string().min(11).max(14).optional(),
});

export type UpdateUserRequestDTO = z.infer<typeof UpdateUserRequestSchema>;
