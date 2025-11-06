import Fastify from 'fastify';
import createSocketServer from './config/socket.js';
import app from './app.js';

const fastify = Fastify({
    logger: {
        level: 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:yyyy-mm-dd HH:MM:ss Z',
                ignore: 'pid,hostname,reqId,req,res,err,responseTime'
            }
        }
    },
    disableRequestLogging: true
});

await app(fastify);

const startServer = async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 3067 });
        fastify.log.info(`Server started on port ${fastify.server.address().port}`);
        createSocketServer(fastify);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

void startServer();
