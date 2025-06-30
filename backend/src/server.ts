import Fastify from 'fastify';
import cors from '@fastify/cors';
import qrRoutes from './routes/qr.js';
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

  return server;
}

// Only run the server if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = build();

  const start = async () => {
    try {
      await server.listen({
        port: parseInt(process.env.PORT || '3001'),
        host: process.env.HOST || '0.0.0.0',
      });
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };

  start();
}
