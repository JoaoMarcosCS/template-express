import z from 'zod';

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export type RefreshDTO = z.infer<typeof RefreshSchema>;
