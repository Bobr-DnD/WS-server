import cors from '@fastify/cors';
import fastifyIO from 'fastify-socket.io';
import customLogger from './plugins/logger.js';

export default async (server) => {
    await server.register(customLogger);
    await server.register(fastifyIO);
    server.register(cors, { origin: '*' });

    server.get('/', async () => {
        return { message: 'WS server is running' };
    });
};
