import Fastify from 'fastify';
import { env } from './config/env';
import { database } from './database/connection';
import { registerPlugins } from './plugins';
import { registerRoutes } from './routes';
import { logger } from './utils/logger';

const server = Fastify({
  logger: env.nodeEnv === 'production'
    ? {
        level: 'info',
      }
    : {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      },
});

// Register plugins
server.register(registerPlugins);

// Register routes
server.register(registerRoutes, { prefix: env.apiPrefix });

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  try {
    await server.close();
    await database.disconnect();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    // Connect to database
    await database.connect();

    // Start server
    await server.listen({ port: env.port, host: '0.0.0.0' });
    logger.info(`Server listening on http://localhost:${env.port}`);
    logger.info(`API prefix: ${env.apiPrefix}`);
    logger.info(`Environment: ${env.nodeEnv}`);
  } catch (err) {
    logger.error('Failed to start server:', err);
    await database.disconnect();
    process.exit(1);
  }
};

start();
