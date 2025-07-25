import Fastify from 'fastify';
import cors from '@fastify/cors';
import qrRoutes from './routes/qr';
import dotenv from 'dotenv';

dotenv.config();

// Build app function for testing
export function build(opts = {}) {
  const server = Fastify({
    logger: process.env.NODE_ENV !== 'test',
    ...opts,
  });

  // Register CORS with more permissive configuration
  server.register(cors, {
    origin: true, // Allow all origins for now
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'User-Agent',
    ],
    credentials: false, // Set to false to avoid complications
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Add a preflight handler for OPTIONS requests
  server.addHook('onRequest', async (request, reply) => {
    if (request.method === 'OPTIONS') {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS, PATCH'
      );
      reply.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept, Origin, User-Agent'
      );
      reply.code(204).send();
      return;
    }
  });

  server.register(qrRoutes);

  server.get('/', async (request, reply) => {
    return { hello: 'world' };
  });

  // Health check endpoint for Docker/Synology health monitoring
  server.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });

  return server;
}
