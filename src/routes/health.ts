import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { database } from '../database/connection';
import { sendSuccess } from '../utils/response';

export default async function healthRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.get('/health', async (request, reply) => {
    const dbStatus = database.getConnectionStatus();
    
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus ? 'connected' : 'disconnected',
    };

    const statusCode = dbStatus ? 200 : 503;
    return sendSuccess(reply, healthData, statusCode);
  });
}
