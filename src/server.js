import createSocketServer from './config/socket.js';
import app from './app.js';
import fastifyInstance from './core/fastify.instance.js';

const fastify = fastifyInstance.server;

await app(fastify);

const startServer = async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 3067, host: '0.0.0.0' });
        fastify.log.info(`Server started on port ${fastify.server.address().port}`);
        createSocketServer(fastify);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

void startServer();
