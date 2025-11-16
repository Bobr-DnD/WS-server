import cors from '@fastify/cors';
import customLogger from './plugins/logger.js';
import mongoosePlugin from './plugins/mongoose.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export default async (fastify) => {
    fastify.register(customLogger);
    fastify.register(cors, { origin: '*' });
    fastify.register(mongoosePlugin, { use_local: process.env.DB_LOCAL === 'true' });

    fastify.get('/', async () => {
        return { message: 'WS server is running' };
    });
};
