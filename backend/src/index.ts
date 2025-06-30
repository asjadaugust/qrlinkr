import { build } from './server.js';

const server = build();

const start = async () => {
  try {
    await server.listen({
      port: parseInt(process.env.PORT || '3001'),
      host: process.env.HOST || '0.0.0.0', // Listen on all interfaces for Docker networking
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
