import z from 'zod';
import { cpf } from 'cpf-cnpj-validator';
import { hasEmoji } from '../../../../shared/utils/has-special-characters';

export const CreateUserSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome é obrigatório')
    .refine((value) => !hasEmoji(value), 'Nome não pode conter emojis')
    .refine(
      (value) => /^[A-Za-zÀ-ÿ\s]+$/.test(value),
      'Nome deve conter apenas letras, espaços e acentos',
    ),
  email: z
    .email('E-mail inválido')
    .refine((value) => !hasEmoji(value), 'E-mail não pode conter emojis'),
  document: z
    .string()
    .min(11, 'Documento é obrigatório')
    .refine((value) => !hasEmoji(value), 'Documento não pode conter emojis')
    .refine(
      (value) => value.replace(/\D/g, '').length !== 14,
      'CNPJ não é permitido, informe um CPF',
    )
    .refine((value) => value.replace(/\D/g, '').length === 11, 'CPF deve conter 11 dígitos')
    .refine((value) => cpf.isValid(value), 'CPF inválido')
    .transform((value) => value.replace(/\D/g, '')),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .refine((value) => !hasEmoji(value), 'Senha não pode conter emojis')
    .refine((value) => /[A-Z]/.test(value), 'Senha deve conter ao menos uma letra maiúscula')
    .refine((value) => /[a-z]/.test(value), 'Senha deve conter ao menos uma letra minúscula')
    .refine((value) => /[0-9]/.test(value), 'Senha deve conter ao menos um número')
    .refine(
      (value) => /[^A-Za-z0-9]/.test(value),
      'Senha deve conter ao menos um símbolo como @, #, &',
    ),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
