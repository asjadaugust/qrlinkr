import { build } from './server.js';

console.log('🔧 Building server...');
const server = build();

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    console.log(`🚀 Starting server on ${host}:${port}...`);
    await server.listen({
      port,
      host,
    });
    
    console.log(`🚀 Server ready at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

console.log('🔧 Calling start function...');
start();
