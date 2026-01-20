import cors from '@fastify/cors';
import customLogger from './plugins/logger.js';
import mongoosePlugin from './plugins/mongoose.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const corsOrigins = process.env.CORS_ORIGIN_WS
  ?.split(',')
  .map(o => o.trim())

  console.log(corsOrigins);
  

export default async (fastify) => {
    fastify.register(customLogger);
    fastify.register(cors, { origin: corsOrigins });
    fastify.register(mongoosePlugin, { use_local: process.env.DB_LOCAL === 'true' });

    fastify.get('/', async () => {
        return { message: 'WS server is running' };
    });
};
