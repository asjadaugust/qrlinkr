import Fastify from 'fastify';
import cors from '@fastify/cors';
import qrRoutes from './routes/qr.js';
import dotenv from 'dotenv';

dotenv.config();

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: 'http://localhost:3000',
});

server.register(qrRoutes);

server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await server.listen({ port: 3001 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
