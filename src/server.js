import Fastify from 'fastify';
import app from 'app.js';
import { createSocketServer } from 'config';

const fastify = Fastify({
    logger: true
});

await app(fastify);

const io = createSocketServer(fastify.server);

const start = async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 3067 });
        console.log(`Server started on port ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

void start();
