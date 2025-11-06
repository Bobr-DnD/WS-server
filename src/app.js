import cors from '@fastify/cors';

export default async (fastify) => {
    await fastify.register(cors(), { origin: '*' });

    fastify.get('/', async () => {
        return { message: 'WS server is running' };
    });
};
