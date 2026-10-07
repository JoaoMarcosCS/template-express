import { PinoLogger } from './PinoLogger';
import { pinoInstance } from './pino';

export const logger = new PinoLogger(pinoInstance);
