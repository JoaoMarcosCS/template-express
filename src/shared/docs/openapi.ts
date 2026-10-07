import { createDocument } from 'zod-openapi';
import { env } from '@/shared/environment/env';
import { usersPaths } from './users/users.docs';

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Template DDD Express',
    version: '1.0.0',
  },
  servers: [{ url: `http://localhost:${env.API_PORT}/api/v1` }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    ...usersPaths,
  },
});
