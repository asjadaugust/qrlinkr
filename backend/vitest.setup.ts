import { beforeAll } from 'vitest';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
beforeAll(() => {
  dotenv.config({ path: resolve(process.cwd(), '.env.test') });
});
