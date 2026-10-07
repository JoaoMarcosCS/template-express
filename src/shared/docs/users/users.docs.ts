import { z } from 'zod';
import type { ZodOpenApiPathsObject } from 'zod-openapi';
import { CreateUserSchema } from '@/modules/users/usecase/create/create-user.schema';
import { SearchUsersSchema } from '@/modules/users/usecase/search/search-users.schema';
import { errorResponse } from '../common/error.docs';

const UserSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    document: z.string(),
    status: z.number(),
  })
  .meta({ id: 'User' });

const SearchUsersResponseSchema = z
  .object({
    data: z.array(UserSchema),
    nextCursor: z.uuid().nullable(),
  })
  .meta({ id: 'SearchUsersResponse' });

export const usersPaths: ZodOpenApiPathsObject = {
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'Busca usuários por nome, e-mail ou documento com paginação por cursor',
      security: [{ bearerAuth: [] }],
      requestParams: { query: SearchUsersSchema },
      responses: {
        '200': {
          description: 'Página de usuários',
          content: { 'application/json': { schema: SearchUsersResponseSchema } },
        },
        '400': errorResponse('Parâmetros inválidos ou cursor inválido'),
        '401': errorResponse('Token ausente ou inválido'),
        '500': errorResponse('Erro interno'),
      },
    },
    post: {
      tags: ['Users'],
      summary: 'Cria um usuário',
      requestBody: {
        content: {
          'application/json': {
            schema: CreateUserSchema,
            example: {
              name: 'João Silva',
              email: 'joao@email.com',
              document: '529.982.247-25',
              password: 'Senha@123',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Usuário criado',
          content: { 'application/json': { schema: UserSchema } },
        },
        '400': errorResponse('Dados inválidos'),
        '409': errorResponse('E-mail ou documento já cadastrado'),
        '500': errorResponse('Erro interno'),
      },
    },
  },
};
