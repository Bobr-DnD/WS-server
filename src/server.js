import fastify from 'fastify';
import createSocketServer from './config/socket.js';
import app from './app.js';

const server = fastify({
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

await app(server);

const startServer = async () => {
    try {
        await server.listen({ port: process.env.PORT || 3067 });
        server.log.info(`Server started on port ${server.server.address().port}`);
        createSocketServer(server);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

void startServer();
