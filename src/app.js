import cors from '@fastify/cors';
import customLogger from './plugins/logger.js';

export default async (fastify) => {
    fastify.register(customLogger);
    fastify.register(cors, { origin: '*' });

    fastify.get('/', async () => {
        return { message: 'WS server is running' };
    });
};
