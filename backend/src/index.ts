import Fastify from 'fastify';
import cors from '@fastify/cors';
import qrRoutes from './routes/qr.js';
import dotenv from 'dotenv';

dotenv.config();

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: [
    'http://localhost:3000',
    /^http:\/\/192\.168\.\d+\.\d+:3000$/, // Allow local network IPs
    /^http:\/\/.*:3000$/, // Allow any domain on port 3000 for development
  ],
});

server.register(qrRoutes);

server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await server.listen({
      port: 3001,
      host: '0.0.0.0', // Listen on all interfaces for Docker networking
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
