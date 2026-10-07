import 'reflect-metadata';
import '@/infra/container/index';
import express from 'express';
import cors from 'cors';
import { routes } from './routes/v1';
import { errorHandler } from './middleware/error-handler';
import swaggerUi from 'swagger-ui-express';
import { env } from '@/shared/environment/env';
import { openApiDocument } from '@/shared/docs/openapi';
import { corsConfig } from './security/cors.config';
import { limiter } from './security/rate-limit.config';
import { httpLogger, requestContextMiddleware } from './middleware/request-logger';
import { environmentCheck } from '@/shared/utils/environment-check';

const app = express();

app.set('trust proxy', 1);

app.use(requestContextMiddleware);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(httpLogger);

app.use(cors(corsConfig));
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!environmentCheck('test')) {
  app.get('/docs.json', (req, res) => res.json(openApiDocument));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

app.use('/api/v1', routes);

app.use((req, res, next) => {
  res.status(404).json({
    error: {
      type: 'NotFoundError',
      message: 'Not Found',
    },
  });
});

app.use(errorHandler);

export { app };
